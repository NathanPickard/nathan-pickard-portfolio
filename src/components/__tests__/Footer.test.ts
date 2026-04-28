import { describe, expect, it, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Footer from '../Footer.astro';

async function renderFooter() {
  const container = await AstroContainer.create();
  return container.renderToString(Footer);
}

describe('Footer.astro year rendering', () => {
  it('renders the current year in copyright text', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));

    const html = await renderFooter();

    expect(html).toContain('© 2026');

    vi.useRealTimers();
  });

  it('updates rendered year when system year changes', async () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2025-12-31T12:00:00Z'));
    const html2025 = await renderFooter();

    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
    const html2026 = await renderFooter();

    expect(html2025).toContain('© 2025');
    expect(html2026).toContain('© 2026');

    vi.useRealTimers();
  });
});
