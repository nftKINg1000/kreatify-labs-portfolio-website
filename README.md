# KreatifyLabs website

The public website for KreatifyLabs, an AI product and creative technology studio. It is a single, pre-rendered page: positioning, the six capabilities, an honest proof section, the delivery lifecycle, indicative engagement pricing, FAQ, and an enquiry form that sends to a real, configurable endpoint.

> Intelligence, made useful.

## Contents

- [Stack](#stack)
- [Architecture](#architecture)
- [Directory map](#directory-map)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Enquiry form and providers](#enquiry-form-and-providers)
- [Deployment](#deployment)
- [Security headers](#security-headers)
- [Accessibility model](#accessibility-model)
- [Motion and reduced motion](#motion-and-reduced-motion)
- [3D scene](#3d-scene)
- [Fonts, model and licences](#fonts-model-and-licences)
- [Editing content](#editing-content)
- [Owner-input workflow](#owner-input-workflow)
- [Testing](#testing)
- [Performance budgets](#performance-budgets)
- [Known trade-offs](#known-trade-offs)

## Stack

| Concern | Choice |
| --- | --- |
| UI | React 19, TypeScript (strict) |
| Build | Vite 8, plus an SSR build that pre-renders `index.html` |
| Styling | Tailwind CSS v4 (tokens and layers) and hand-written component CSS in `src/index.css` |
| 3D | three.js in a lazy chunk, loaded only when the device qualifies |
| Server | One Web-standard `Request → Response` handler (`server/lead-handler.ts`) with a Vercel adapter (`api/lead.ts`) |
| Tests | Vitest + Testing Library (unit, component, server), Playwright + axe-core (e2e, accessibility, visual) |
| Quality gates | oxlint, `tsc -b`, budget script, structured-data check, Lighthouse CI, `npm audit` |

## Architecture

```
index.html ─ meta, canonical, Open Graph, JSON-LD, <!--app-html-->
   │
   ├─ build: vite build            → dist/ (client bundle)
   ├─ build: vite build --ssr      → dist-ssr/entry-server.js
   └─ scripts/prerender.mjs        → injects rendered HTML into dist/index.html,
                                     writes robots.txt + sitemap.xml, removes dist-ssr
browser
   main.tsx → hydrateRoot(App)     (createRoot when the HTML is empty, e.g. in dev)
     ├─ sections (static content from src/content)
     ├─ LeadDialog                 lazy; prefetched on idle; mounted on first open
     ├─ SceneLayer → StatueScene   lazy three.js chunk; skipped when unsupported
     └─ reportWebVitals()          web-vitals on idle → optional collector
POST /api/lead
   api/lead.ts → server/lead-handler.ts → transport (Resend | webhook) 
```

- **Content is data.** All copy lives in `src/content/index.ts`, typed by `src/content/types.ts`. Components contain no marketing copy.
- **One validation module** (`src/shared/lead.ts`) is used by both the form and the server, so the rules cannot drift.
- **The page works without JavaScript.** Every section is in the pre-rendered HTML. Navigation uses real `#anchors`, and the contact section exposes the email address.

## Directory map

```
api/lead.ts                  Vercel Function adapter for POST /api/lead
server/                      Lead handler, rate limiter, transports, and their tests
src/
  App.tsx                    Page composition, skip link, lead context
  main.tsx                   Hydration entry
  entry-server.tsx           SSR entry used by the pre-render step
  config.ts                  Public runtime config from VITE_* variables
  content/                   Copy, pricing, FAQ, lifecycle (typed)
  shared/lead.ts             Lead schema, normalisation, validation (client + server)
  lib/                       analytics, vitals, lead provider, scene support, navigation, idle
  components/
    layout/                  Header (with mobile menu), Footer
    sections/                Hero, Audience, Capabilities, Proof, Approach, Signature, Pricing, Faq, Contact
    lead/                    LeadDialog, LeadForm
    scene/                   SceneLayer (gate + error boundary), StatueScene (three.js)
    ui/                      Dialog, CtaButton, Logo, OwnerBadge
  fonts.css, index.css       Font faces, tokens, components, preference overrides
public/                      Icons, share image, brand logo, fallback image, fonts, model, _headers
scripts/                     prerender, budgets, structured data, audit, brand assets, header sync
e2e/                         Playwright specs and visual baselines
security-headers.json        Single source for response headers
.github/workflows/ci.yml     CI pipeline
```

## Local development

Requires Node 22 or later.

```bash
npm ci
npm run dev          # http://localhost:5173 — /api/lead is served by a dev adapter
npm run build        # typecheck, client build, SSR build, pre-render
npm run preview      # http://localhost:4173 — production build with production headers
```

In `dev` and `preview`, `/api/lead` runs the real handler with a **dev-log transport**. It validates the submission and logs a redacted line (no field contents), then answers `delivered: false, mode: 'dev-log'`. The form then shows "Not sent (development mode)", so nobody mistakes a local test for a delivered enquiry.

## Environment variables

**Public (build time, shipped to browsers). Never put secrets here.**

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_SITE_URL` | Canonical origin, used for the canonical link, Open Graph URLs, JSON-LD, robots.txt and the sitemap. No trailing slash. | `https://kreatifylabs.com` (owner to confirm) |
| `VITE_LEAD_ENDPOINT` | Where the form posts | `/api/lead` |
| `VITE_ANALYTICS_ENDPOINT` | Optional same-origin collector for safe events | empty (disabled) |
| `VITE_VITALS_ENDPOINT` | Optional collector for Web Vitals | empty (disabled) |

If you point either collector at another origin, add that origin to `connect-src` in `security-headers.json`.

**Server (set in the host's environment settings only).**

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL` | Email delivery through Resend (all three required) |
| `LEAD_WEBHOOK_URL` | Alternative: POST the enquiry as JSON to a webhook (Slack, Make, Zapier, n8n …) |
| `ALLOWED_ORIGINS` | Comma-separated origins allowed to post; requests from other origins get 403 |

## Enquiry form and providers

**Client** (`src/components/lead/LeadForm.tsx`, `src/lib/leadProvider.ts`)

- Every field has a visible label. Errors appear inline (`aria-describedby`) and in a focusable error summary.
- Validation runs on submit. Editing a field clears its error.
- Answers survive closing the dialog and failed submissions.
- States:
  - sending (`aria-busy`)
  - delivered, with a reference
  - development mode
  - invalid
  - offline
  - rate limited
  - not configured
  - delivery failed
  - timeout
- Every failure keeps the data, offers **Try again**, and offers a pre-filled `mailto:` fallback.
- The engagement choice shows the indicative price for that one engagement and says it is not a quote. Nothing is summed into a total.
- The success message is shown only when the server confirms delivery.

**Server** (`server/lead-handler.ts`)

| Request | Response |
| --- | --- |
| Not a POST | 405 |
| Origin not in `ALLOWED_ORIGINS` | 403 |
| Not JSON | 415 |
| Body over 16 KB | 413 |
| Malformed JSON | 400 |
| Rate limited (5 per 10 minutes per client) | 429 |
| Fails the shared validation | 422 with per-field errors |
| Honeypot field filled | 400, nothing delivered |
| No transport configured | 503 `not_configured` |
| Transport error | 502 `delivery_failed` |
| Delivered | 200 with reference `KL-…` |

- Payloads are never logged. The rate-limit key is a SHA-256 hash of the client address, never the raw IP.
- **Adding a provider:** implement `Transport` (`(lead, reference) => Promise<{ ok: boolean }>`) and return it from `transportFromEnv`.
- **Durable rate limiting:** the default `memoryRateLimiter` is per serverless instance. For real abuse protection, implement `RateLimiter.allow(key)` against a shared store (Upstash Redis, Vercel KV, or similar) and pass it in `api/lead.ts`.

**Analytics** (`src/lib/analytics.ts`)

- Only these events are sent: `form_opened`, `form_started`, `service_selected`, `form_submission_succeeded` and `form_submission_failed`.
- Properties are allow-listed and must match `^[a-z0-9_-]{1,40}$` (for example `source: 'hero'`, `reason: 'network'`). Form contents can't be expressed in that format, so they are never sent.

## Deployment

The default target is **Vercel**:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Lead endpoint:** `api/lead.ts` is picked up as a Function automatically.
- **Headers and caching:** come from `vercel.json`.

Set the server variables above in Project → Settings → Environment Variables, and set `VITE_SITE_URL` per environment.

**Other static hosts** (Netlify, Cloudflare Pages):

- `public/_headers` is copied into `dist`.
- Port the handler by wrapping `handleLeadRequest` in that platform's function signature. It already uses Web-standard `Request`/`Response`.

Before going live:

1. Confirm the domain and set `VITE_SITE_URL`.
2. Configure a transport and send a real test enquiry.
3. Check headers with `curl -I https://<domain>/`.
4. Run Google's Rich Results Test against the live URL.
5. Submit the sitemap in Search Console.

## Security headers

`security-headers.json` is the single source. `node scripts/sync-headers.mjs` regenerates `vercel.json` and `public/_headers`. `vite preview` applies the same headers, so the e2e suite runs under the production policy. `server/security-headers.test.ts` fails if the three copies drift.

- **CSP:**
  - `default-src 'self'`
  - no `unsafe-inline` for scripts or styles
  - `'wasm-unsafe-eval'`, needed only for the meshopt decoder that unpacks the 3D model
  - `frame-ancestors 'none'`
  - `form-action 'self'`
  - `object-src 'none'`
- **HSTS:** two years with `includeSubDomains; preload`. Remove `preload` if the domain is not ready to be submitted to the preload list.
- **Other headers:** `nosniff`, `strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, `X-Frame-Options: DENY` and `Cross-Origin-Opener-Policy: same-origin`.
- **Caching:** hashed `/assets` are immutable for one year; HTML revalidates on every request.

There is no privacy page yet. The form states what happens to the answers ("sent to KreatifyLabs only to reply to this enquiry; not added to analytics"). A full policy needs owner-approved legal text (see [owner input](#owner-input-workflow)).

## Accessibility model

Target: WCAG 2.2 AA.

- **Skip link:**
  - goes to `#main`
  - one `h1`
  - sections labelled by their headings
  - the heading order is checked by axe
- **Dialogs** (`src/components/ui/Dialog.tsx`):
  - native `<dialog>` with `showModal()`
  - `aria-labelledby` and `aria-describedby`
  - focus moves to the first field or the heading
  - Tab and Shift+Tab wrap inside the dialog
  - Escape and a backdrop click close it
  - focus returns to the element that opened it
- **Mobile menu:**
  - the button has `aria-expanded` and `aria-controls="mobile-menu"`
  - the menu is a full-screen dialog with the same focus rules
  - choosing a link closes the menu, scrolls to the section and focuses it
- **Focus:**
  - a 3 px `:focus-visible` outline that follows the section theme
  - interactive targets are at least 44 px high
- **Zoom and reflow:**
  - type and spacing use `rem` clamps
  - no horizontal overflow at 320 px (the reflow width for 400 % zoom at 1280 px), checked by e2e and the 8-viewport audit
- **Forced colours:** borders, focus and controls fall back to system colours.
- **Contrast:** checked by axe on every section at desktop and mobile widths.

## Motion and reduced motion

Motion uses the brand timing tokens: 480 ms, `cubic-bezier(.2,0,0,1)`, a 40 ms stagger and at most 8 px of travel. Content is never held back. There is no intro gate, no pinned or scroll-jacking sequence, and no smooth-scroll library.

With `prefers-reduced-motion: reduce`:

- animations and transitions are removed
- anchor jumps are instant
- the scroll-driven line settle in the signature section is disabled
- the 3D scene is not loaded

## 3D scene

`SceneLayer` decides whether to load the scene, using `src/lib/sceneSupport.ts`. The scene is skipped on:

- the server
- reduced motion
- Save-Data
- viewports narrower than 1024 px
- low-power devices (`deviceMemory` or `hardwareConcurrency` below 4)
- no WebGL
- the `?no3d` query parameter

When the scene qualifies:

- **Loading:** it is imported on idle as a separate chunk inside an error boundary. Until it is ready, or if it fails, a static image (`public/images/statue-fallback.webp`) is shown. That image is not downloaded on phones.
- **Rendering:** on demand only. A frame is drawn on scroll, pointer movement or resize, and the loop stops once motion settles (0 draw calls when idle, checked by the `@scene` e2e test). Rendering pauses when the tab is hidden.
- **Device load:** `powerPreference: 'low-power'` and a device-pixel ratio capped at 1.5.
- **Failure and cleanup:** WebGL context loss falls back to the static image. Unmounting disposes geometry, materials, textures and the renderer.

## Fonts, model and licences

| Asset | Source | Licence |
| --- | --- | --- |
| Anton (400) | `@fontsource/anton`, latin subset | SIL Open Font License 1.1 |
| Roboto (400/700/900) | `@fontsource/roboto`, latin subset | SIL Open Font License 1.1 |
| Panchang (700) | `public/fonts/panchang-700.woff2`, self-hosted | ITF Free Font License (Indian Type Foundry / Fontshare). Owner to keep a copy of the licence with the brand files. |
| `public/models/liberty.glb` | "Statue of Liberty" by Maurice Svay ([Sketchfab](https://sketchfab.com/3d-models/statue-of-liberty-c461ed8724424ad99500fd058a0ab082)); transforms baked, texture and UVs removed, simplified from 699k to 84k triangles, meshopt-compressed (31 MB → 272 kB) | CC BY 4.0 — credited in the footer; keep that credit |
| Logo, A symbol | Approved KreatifyLabs v1.2 paths, `src/components/ui/Logo.tsx` | KreatifyLabs |

Metric-matched fallback faces (`Anton Fallback`, `Roboto Fallback`, `Panchang Fallback`) keep layout shift near zero while web fonts swap in.

`npm run assets:brand` regenerates the favicon, the Apple touch icon, the share image and the logo PNG from the SVG sources.

## Editing content

Edit `src/content/index.ts`. The types in `src/content/types.ts` keep the structure valid, and `src/content/content.test.ts` checks the rules:

- six capabilities
- prices that carry a basis and the currency
- no draft items in production

| What | Where |
| --- | --- |
| Navigation | `NAV`; anchors must match section `id`s |
| Prices | `PRICING` and `PRICING_META` (currency and note). Each price has a `basis` (`fixed`, `starting-at`, `typical-range`, `indicative`), shown next to the amount. The form's engagement hint reads from the same data. |
| Case studies | `CASE_STUDIES`. The proof section renders them only when the array is non-empty. Add real, client-approved work only. |
| FAQ | `FAQ` |

## Owner-input workflow

Content the site cannot state truthfully yet is marked `ownerInput: '<what is needed>'`:

- `published()` hides these items in production builds.
- In `npm run dev` they are shown with a red **Owner input** badge, so the gaps are visible during review.
- To publish an item, write the real text and delete its `ownerInput` field.

Open items:

1. Confirm the production domain (`VITE_SITE_URL`) and the enquiry inbox (`hello@kreatifylabs.com`).
2. Confirm that prices are in US dollars and are "indicative", or supply the correct basis.
3. FAQ answers on IP ownership, data processing, and change requests.
4. A privacy policy with approved legal text, before adding a privacy page.
5. Case studies with client permission.
6. The response-time wording in the contact section.
7. Panchang and model licence records (see above).

## Testing

```bash
npm run lint             # oxlint
npm run typecheck        # tsc -b
npm test                 # Vitest: shared validation, server handler, headers sync, dialog, form, content, SSR
npm run test:e2e         # Playwright: desktop, mobile, scene (and visual, see below); builds nothing — run `npm run build` first
npm run test:a11y        # axe WCAG 2.2 A/AA scans only
npm run test:visual      # visual baselines (update with: npx playwright test --project=visual --update-snapshots)
npm run perf:budget      # bundle budgets (after build)
npm run validate:schema  # JSON-LD, canonical, social metadata, crawl files (after build)
npm run lhci             # Lighthouse CI, mobile, 3 runs, asserts the score floors
npm run audit:deps       # production dependency audit
node scripts/audit.mjs [url] [outDir]   # 8-viewport audit with screenshots, axe, LCP/CLS, no-JS, reduced motion
```

The e2e journeys cover:

- **Navigation and focus:**
  - header anchors and the skip link
  - every dialog by mouse and keyboard
  - focus trap and focus return
  - backdrop close
  - the mobile menu, including Escape
- **Form:**
  - valid, invalid
  - network failure followed by a successful retry
  - not-configured fallback
  - development-mode wording
- **Pricing:** content and the indicative label.
- **Resilience:**
  - reduced motion
  - WebGL unavailable
  - JavaScript disabled
  - a 320 px viewport
- **Accessibility:** axe on the page, the dialog, an open FAQ item and the mobile menu.
- **3D:**
  - the lazy chunk loads
  - idle frames issue 0 draw calls

Playwright projects:

| Project | Setup | Tests |
| --- | --- | --- |
| `desktop` | WebGL disabled | functional tests |
| `mobile` | Pixel 7 | `@mobile` and `@a11y` |
| `scene` | SwiftShader WebGL | `@scene` |
| `visual` | — | `@visual` screenshots |

## Performance budgets

| Budget | Limit | Enforced by |
| --- | --- | --- |
| Initial JS (gzip) | < 200 kB | `scripts/check-budgets.mjs` |
| Initial CSS (gzip) | < 20 kB | `scripts/check-budgets.mjs` |
| Pre-rendered HTML (gzip) | < 40 kB | `scripts/check-budgets.mjs` |
| Lazy 3D chunk (gzip) | < 200 kB | `scripts/check-budgets.mjs` |
| 3D code or model in the initial HTML | none allowed | `scripts/check-budgets.mjs` |
| Lighthouse mobile | performance ≥ 90; accessibility, best practices and SEO ≥ 95 | `lighthouserc.json` |
| LCP | ≤ 2.5 s | `lighthouserc.json` |
| CLS | ≤ 0.1 | `lighthouserc.json` |
| TBT | ≤ 200 ms (warning only) | `lighthouserc.json` |

INP can only be measured in the field. Set `VITE_VITALS_ENDPOINT` to collect LCP, INP and CLS from real visits.

`build.chunkSizeWarningLimit` is 700 kB because the lazy three.js chunk is about 630 kB raw (157 kB gzip). It is never on the initial path, and the budget script fails the build if it ever is.

## Known trade-offs

- **No Lenis, GSAP or pinned sequences.** The earlier build copied lenis.dev's scroll-jacked layout, and the brief rules that out. The page is now original sections with native scrolling, about half the old page height.
- **The 3D statue is desktop-only** (1024 px and up, capable devices). Phones get the static composition, which saves 157 kB of JS and the model download.
- **Visual baselines are platform-specific.** The committed snapshots are Windows (`*-win32.png`), so CI runs every project except `visual`. Record Linux baselines in CI if you want visual checks there.
- **Vitest 3 runs alongside Vite 8.** Vitest uses its own bundled Vite, so `vitest.config.ts` is kept separate and uses no Vite plugins.
- **`npm audit` reports advisories in dev-only tooling**: 11 high through `@lhci/cli` (lighthouse, puppeteer, proxy-agent, tmp) and moderate ones in `vitest` 3. None of these ship to browsers or run on the server. The production dependency tree audits clean, and CI gates on `npm audit --omit=dev`.
- **The rate limiter is per instance** until a shared store is plugged in (see [providers](#enquiry-form-and-providers)).
- **The Vercel adapter has not been exercised on a live deployment yet.** The handler itself is covered by unit tests and runs in the e2e suite through the preview adapter.
