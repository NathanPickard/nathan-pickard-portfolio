import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Nav from '../Nav.astro';

async function renderNav() {
  const container = await AstroContainer.create();
  return container.renderToString(Nav);
}

async function renderNavAt(path: string) {
  const container = await AstroContainer.create();
  return container.renderToString(Nav, { request: new Request(`http://localhost${path}`) });
}

describe('Nav.astro current page', () => {
  it('marks the current section link with aria-current="page" in both navs', async () => {
    const html = await renderNavAt('/blog/some-post/');

    expect(html.match(/aria-current="page"/g)).toHaveLength(2);
    expect(html.match(/<a href="\/blog"[^>]*aria-current="page"/g)).toHaveLength(2);
  });

  it('marks no section link as current on the home page', async () => {
    const html = await renderNavAt('/');

    expect(html).not.toContain('aria-current');
  });
});

describe('Nav.astro wordmark', () => {
  // WCAG 2.5.3: a voice user says what they see ("click NP"), so the
  // accessible name must contain the visible text.
  it('has an accessible name that includes its visible text', async () => {
    const html = await renderNav();
    const label = html.match(/class="dark-wordmark[^"]*"[^>]*aria-label="([^"]+)"/)?.[1] ?? '';

    expect(label).toContain('NP');
  });
});

describe('Nav.astro', () => {
  it('renders the mobile menu inert so its closed links are out of the tab order', async () => {
    const html = await renderNav();

    expect(html).toMatch(/<div[^>]*id="mobile-menu"[^>]*\binert\b/);
  });

  it('does not rely on aria-hidden to hide the closed mobile menu', async () => {
    const html = await renderNav();

    expect(html).not.toMatch(/<div[^>]*id="mobile-menu"[^>]*aria-hidden/);
  });
});
