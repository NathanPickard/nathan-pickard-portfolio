import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Header from '../Header.astro';

async function renderHeader() {
  const container = await AstroContainer.create();
  return container.renderToString(Header);
}

describe('Header.astro', () => {
  it('renders the site title and core internal links', async () => {
    const html = await renderHeader();

    expect(html).toContain('Nathan Pickard');
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/blog"');
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/resume"');
  });

  it('renders social links and accessibility labels', async () => {
    const html = await renderHeader();

    expect(html).toContain('https://www.linkedin.com/in/nathanpickard/');
    expect(html).toContain('https://github.com/nathanpickard');
    expect(html).toContain('https://bsky.app/profile/nathanpickard.bsky.social');
    expect(html).toContain('https://x.com/NathanPickard');

    expect(html).toContain('Connect with Nathan Pickard on LinkedIn');
    expect(html).toContain("Go to Nathan's GitHub");
    expect(html).toContain('Follow Nathan Pickard on Bluesky');
    expect(html).toContain('Follow Nathan Pickard on X');
  });

  it('renders mobile menu controls with expected attributes', async () => {
    const html = await renderHeader();

    expect(html).toContain('class="hamburger"');
    expect(html).toContain('aria-label="Open menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('class="nav-menu"');
  });
});
