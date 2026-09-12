import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Button from '../Button.astro';

type ButtonProps = {
  href: string;
  variant?: 'primary' | 'ghost';
  arrow?: boolean;
};

async function renderButton(props: ButtonProps, label = 'Click me') {
  const container = await AstroContainer.create();
  return container.renderToString(Button, {
    props,
    slots: { default: label },
  });
}

describe('Button.astro', () => {
  it('renders a primary link by default with the slot text', async () => {
    const html = await renderButton({ href: '/resume' }, 'View Resume');

    expect(html).toMatch(/<a[^>]*href="\/resume"/);
    expect(html).toMatch(/class="btn btn--primary/);
    expect(html).toContain('View Resume');
  });

  it('renders the ghost variant when asked', async () => {
    const html = await renderButton({ href: '/blog', variant: 'ghost' });

    expect(html).toMatch(/class="btn btn--ghost/);
    expect(html).not.toContain('btn--primary');
  });

  it('omits the arrow unless requested', async () => {
    const html = await renderButton({ href: '/x' });

    expect(html).not.toContain('class="arrow"');
  });

  it('renders an animated arrow span when requested', async () => {
    const html = await renderButton({ href: '/x', arrow: true });

    expect(html).toMatch(/<span class="arrow"[^>]*>→<\/span>/);
  });
});
