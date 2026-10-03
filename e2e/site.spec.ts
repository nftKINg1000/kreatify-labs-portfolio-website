import { expect, test, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function axe(page: Page, include?: string) {
  const builder = new AxeBuilder({ page }).withTags(WCAG);
  if (include) builder.include(include);
  const { violations } = await builder.analyze();
  return violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`);
}

const validLead = async (page: Page) => {
  const dialog = page.getByRole('dialog', { name: 'Discuss your product' });
  await dialog.getByLabel(/^Name/).fill('Ada Lovelace');
  await dialog.getByLabel(/^Email/).fill('ada@example.com');
  await dialog.getByLabel(/What are you building/).fill('We need our prototype hardened for production use.');
  return dialog;
};

test.describe('navigation', () => {
  test('header links are real anchors that update the hash and reach each section', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    for (const [label, id] of [
      ['Capabilities', 'capabilities'],
      ['Approach', 'approach'],
      ['Pricing', 'pricing'],
      ['FAQ', 'faq'],
    ] as const) {
      await nav.getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });

  test('skip link is first in tab order, visible on focus, and moves focus to main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator('#main')).toBeFocused();
  });
});

test.describe('enquiry dialog', () => {
  test('opens by mouse, focuses the first field, closes on Escape and returns focus', async ({ page }) => {
    await page.goto('/');
    const invoker = page.getByRole('banner').getByRole('link', { name: 'Discuss your product' });
    await invoker.click();
    const dialog = page.getByRole('dialog', { name: 'Discuss your product' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel(/^Name/)).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(invoker).toBeFocused();
  });

  test('works by keyboard and keeps focus trapped inside', async ({ page }) => {
    await page.goto('/');
    const invoker = page.locator('.hero').getByRole('link', { name: 'Discuss your product' });
    await invoker.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Discuss your product' });
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press(i % 7 === 6 ? 'Shift+Tab' : 'Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('dialog[open]'))).toBe(true);
    }
    await dialog.getByRole('button', { name: 'Close' }).press('Enter');
    await expect(dialog).toBeHidden();
    await expect(invoker).toBeFocused();
  });

  test('closes when the backdrop is clicked', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero').getByRole('link', { name: 'Discuss your product' }).click();
    const dialog = page.getByRole('dialog', { name: 'Discuss your product' });
    await expect(dialog).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(dialog).toBeHidden();
  });
});

test.describe('lead form', () => {
  test('valid submission shows success only after confirmed delivery', async ({ page }) => {
    await page.route('**/api/lead', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, delivered: true, reference: 'KL-E2E' }) }),
    );
    await page.goto('/');
    await page.locator('.hero').getByRole('link', { name: 'Discuss your product' }).click();
    const dialog = await validLead(page);
    await dialog.getByRole('radio', { name: 'Product' }).check();
    await expect(dialog.getByText(/US\$9,800 per project\. This is not a quote/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Send enquiry' }).click();
    await expect(dialog.getByRole('status')).toContainText('Enquiry sent');
    await expect(dialog.getByRole('status')).toContainText('KL-E2E');
  });

  test('the local endpoint reports development mode, never delivery', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero').getByRole('link', { name: 'Discuss your product' }).click();
    const dialog = await validLead(page);
    await dialog.getByRole('button', { name: 'Send enquiry' }).click();
    await expect(dialog.getByRole('status')).toContainText('Not sent (development mode)');
  });

  test('invalid submission focuses an error summary and marks fields', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero').getByRole('link', { name: 'Discuss your product' }).click();
    const dialog = page.getByRole('dialog', { name: 'Discuss your product' });
    await dialog.getByLabel(/^Email/).fill('not-an-email');
    await dialog.getByRole('button', { name: 'Send enquiry' }).click();
    const summary = dialog.getByRole('alert');
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('Enter your name');
    await expect(dialog.getByLabel(/^Email/)).toHaveAttribute('aria-invalid', 'true');
  });

  test('network failure keeps the data, offers email, and retry succeeds', async ({ page }) => {
    let attempts = 0;
    await page.route('**/api/lead', (route) => {
      attempts += 1;
      return attempts === 1
        ? route.abort('internetdisconnected')
        : route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, delivered: true, reference: 'KL-RETRY' }) });
    });
    await page.goto('/');
    await page.locator('.hero').getByRole('link', { name: 'Discuss your product' }).click();
    const dialog = await validLead(page);
    await dialog.getByRole('button', { name: 'Send enquiry' }).click();
    await expect(dialog.getByRole('alert')).toContainText('answers are kept');
    await expect(dialog.getByRole('link', { name: /Email hello@kreatifylabs.com/ })).toHaveAttribute('href', /mailto:/);
    await expect(dialog.getByLabel(/^Name/)).toHaveValue('Ada Lovelace');
    await dialog.getByRole('button', { name: 'Try again' }).click();
    await expect(dialog.getByRole('status')).toContainText('KL-RETRY');
  });

  test('an unconfigured endpoint is reported honestly', async ({ page }) => {
    await page.route('**/api/lead', (route) =>
      route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'not_configured' }) }),
    );
    await page.goto('/');
    await page.locator('.hero').getByRole('link', { name: 'Discuss your product' }).click();
    const dialog = await validLead(page);
    await dialog.getByRole('button', { name: 'Send enquiry' }).click();
    await expect(dialog.getByRole('alert')).toContainText('nothing was sent');
  });
});

test.describe('pricing', () => {
  test('cards state basis, currency and amount', async ({ page }) => {
    await page.goto('/#pricing');
    const pricing = page.getByRole('region', { name: 'Three ways to work together' });
    await expect(pricing.getByText('Indicative', { exact: true })).toHaveCount(3);
    for (const amount of ['US$4,500', 'US$9,800', 'US$12,000']) await expect(pricing.getByText(amount)).toBeVisible();
    await expect(pricing.getByText(/Indicative prices in US dollars/)).toBeVisible();
  });
});

test.describe('resilience', () => {
  test('reduced motion: no 3D, static hero, no animation delays', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-scene-support', 'reduced-motion');
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator('.hero__fallback')).toBeVisible();
    const duration = await page.locator('.hero__wordmark').evaluate((el) => getComputedStyle(el).animationDuration);
    expect(parseFloat(duration)).toBeLessThan(0.01);
  });

  test('WebGL unavailable: fallback image, no 3D download, no errors', async ({ page }) => {
    const errors: string[] = [];
    const requests: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('request', (r) => requests.push(r.url()));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-scene-support', 'no-webgl');
    await expect(page.locator('.hero__fallback')).toBeVisible();
    await page.waitForTimeout(3000);
    expect(requests.some((u) => u.includes('liberty.glb') || u.includes('StatueScene'))).toBe(false);
    expect(errors).toEqual([]);
  });

  test('works without JavaScript: full content and crawlable links', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('KreatifyLabs');
    await expect(page.getByRole('heading', { name: 'Six capabilities, one lifecycle' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Questions, answered plainly' })).toBeVisible();
    await expect(page.locator('.hero').getByRole('link', { name: 'Discuss your product' })).toHaveAttribute('href', '#contact');
    await context.close();
  });

  test('320px: reflows without horizontal scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
  });
});

test.describe('mobile menu @mobile', () => {
  test('opens by keyboard, exposes state, closes on Escape with focus restored', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Menu' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAttribute('aria-controls', 'mobile-menu');
    await button.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('dialog', { name: 'Menu' });
    await expect(menu).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('menu links navigate, close the menu and move focus to the section', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Pricing' }).click();
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden();
    await expect(page).toHaveURL(/#pricing$/);
    await expect(page.locator('#pricing')).toBeFocused();
  });

  test('opening the form from the menu returns focus to the menu button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Discuss your product' }).click();
    const form = page.getByRole('dialog', { name: 'Discuss your product' });
    await expect(form).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(form).toBeHidden();
    await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused();
  });
});

test.describe('accessibility @a11y', () => {
  test('page has no WCAG 2.2 A/AA violations', async ({ page }) => {
    await page.goto('/');
    expect(await axe(page)).toEqual([]);
  });

  test('open enquiry dialog has no violations', async ({ page }) => {
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('#contact').getByRole('link', { name: 'Discuss your product' }).click();
    await expect(page.getByRole('dialog', { name: 'Discuss your product' })).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Send enquiry' }).click(); // include error states
    expect(await axe(page, 'dialog[open]')).toEqual([]);
  });

  test('FAQ answers are disclosed with native details', async ({ page }) => {
    await page.goto('/#faq');
    const question = page.getByText('Can you review a prototype we already have?');
    await question.click();
    await expect(page.getByText(/Prototype-to-production work is one of our six capability families/)).toBeVisible();
  });
});

test.describe('mobile a11y @a11y @mobile', () => {
  test('open mobile menu has no violations', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible();
    expect(await axe(page, 'dialog[open]')).toEqual([]);
  });
});

test.describe('3D scene @scene', () => {
  test('loads lazily on capable desktops, hides the fallback, and is decorative', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/has-scene/, { timeout: 30_000 });
    await expect(page.locator('.scene-layer')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.hero__fallback')).toHaveCSS('opacity', '0');
    expect(errors).toEqual([]);
  });

  test('stops rendering when idle', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/has-scene/, { timeout: 30_000 });
    await page.waitForTimeout(1500);
    const frames = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          const canvas = document.querySelector('canvas')!;
          const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext;
          let draws = 0;
          const original = gl.drawElements.bind(gl);
          gl.drawElements = (...args: Parameters<typeof gl.drawElements>) => {
            draws += 1;
            return original(...args);
          };
          setTimeout(() => resolve(draws), 1500);
        }),
    );
    expect(frames).toBe(0);
  });
});

test.describe('visual regression @visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  for (const [name, width, height] of [
    ['desktop', 1440, 900],
    ['mobile', 390, 844],
  ] as const) {
    test(`hero ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`hero-${name}.png`);
    });

    test(`pricing ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      // The sticky header overlaps the section at a scroll-dependent offset; hide it so the snapshot is stable.
      await expect(page.locator('#pricing')).toHaveScreenshot(`pricing-${name}.png`, {
        style: '.site-header, .skip-link { visibility: hidden !important; }',
      });
    });
  }

  test('enquiry dialog', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.hero').getByRole('link', { name: 'Discuss your product' }).click();
    await expect(page.getByRole('dialog', { name: 'Discuss your product' })).toHaveScreenshot('dialog.png');
  });
});
