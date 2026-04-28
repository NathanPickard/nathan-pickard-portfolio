import { describe, expect, it, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Footer from '../Footer.astro';

async function renderFooter() {
  const container = await AstroContainer.create();
  return container.renderToString(Footer);
}

describe('Footer.astro', () => {
  it('renders profile text and social links from component output', async () => {
    const html = await renderFooter();

    expect(html).toContain('Nathan Pickard');
    expect(html).toContain('Software Engineer');
    expect(html).toContain('Portland, OR');

    expect(html).toContain('https://github.com/nathanpickard');
    expect(html).toContain('https://www.linkedin.com/in/nathanpickard/');
    expect(html).toContain('https://bsky.app/profile/nathanpickard.bsky.social');
    expect(html).toContain('https://x.com/NathanPickard');
    expect(html).toContain('mailto:nathanppickard@gmail.com');
  });

  it('renders external-link attributes and invert markers used by styles', async () => {
    const html = await renderFooter();

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('data-invert="true"');
    expect(html).toContain('aria-label="GitHub"');
    expect(html).toContain('aria-label="Email"');
  });

  it('renders the current year and respects mocked time', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-01-01T12:00:00Z'));

    const html = await renderFooter();

    expect(html).toContain('© 2027');

    vi.useRealTimers();
  });
});
