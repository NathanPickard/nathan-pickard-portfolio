import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Nav from '../Nav.astro';

async function renderNav() {
  const container = await AstroContainer.create();
  return container.renderToString(Nav);
}

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
