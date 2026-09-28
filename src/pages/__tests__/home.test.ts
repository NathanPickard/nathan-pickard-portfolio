import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Home from '../index.astro';

async function renderHome(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Home);
}

/** Heading levels in document order, e.g. [1, 2, 3, 3]. */
function headingLevels(html: string): number[] {
  return [...html.matchAll(/<h([1-6])[\s>]/g)].map((match) => Number(match[1]));
}

describe('home page structure', () => {
  it('wraps the page content in a single main landmark', async () => {
    const html = await renderHome();

    expect(html.match(/<main[\s>]/g)).toHaveLength(1);
  });

  it('puts the hero and the activity feeds inside main', async () => {
    const html = await renderHome();
    const mainStart = html.search(/<main[\s>]/);
    const mainEnd = html.indexOf('</main>');

    for (const marker of ['class="hero"', 'class="feeds-section"']) {
      const position = html.indexOf(marker);
      expect(position).toBeGreaterThan(mainStart);
      expect(position).toBeLessThan(mainEnd);
    }
  });

  it('never skips a heading level on the way down', async () => {
    const levels = headingLevels(await renderHome());

    expect(levels[0]).toBe(1);
    levels.slice(1).forEach((level, i) => {
      expect(level, `h${levels[i]} is followed by h${level}`).toBeLessThanOrEqual(levels[i] + 1);
    });
  });
});
