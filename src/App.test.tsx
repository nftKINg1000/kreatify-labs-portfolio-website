import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { render, screen, within } from '@testing-library/react';
import App from './App';

describe('App', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('pre-renders the full page on the server (crawlable, works without JavaScript)', () => {
    vi.stubEnv('DEV', false); // production build: owner-input drafts are hidden
    const html = renderToString(<App />);
    for (const text of ['Intelligence,', 'Six capabilities, one lifecycle', 'Define to evolve', 'Three ways to work together', 'Questions, answered plainly', 'Skip to content']) {
      expect(html).toContain(text);
    }
    expect(html).toContain('href="#capabilities"');
    expect(html).not.toContain('Owner input required');
  });

  it('exposes landmarks, a single h1 and real anchor links for navigation', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '#pricing');
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
  });

  it('describes prices as indicative US dollar amounts', () => {
    render(<App />);
    const pricing = screen.getByRole('region', { name: /three ways to work together/i });
    expect(within(pricing).getAllByText('Indicative')).toHaveLength(3);
    expect(within(pricing).getByText(/US\$9,800/)).toBeInTheDocument();
    expect(within(pricing).getByText(/Indicative prices in US dollars/i)).toBeInTheDocument();
  });
});
