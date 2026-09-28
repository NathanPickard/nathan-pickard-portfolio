import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import resume from '../../data/resume.json';
import About from '../about.astro';
import BlogIndex from '../blog/index.astro';
import Home from '../index.astro';
import Resume from '../resume.astro';

async function render(page: AstroComponentFactory): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(page);
}

describe('about page', () => {
  it('makes the "Life outside the IDE" card title a heading', async () => {
    const html = await render(About);

    expect(html).toMatch(/<h2[^>]*class="pnw-title"[^>]*>Life outside the IDE<\/h2>/);
  });

  it('marks up the card items as a list', async () => {
    const html = await render(About);

    expect(html.match(/<li[^>]*class="pnw-item"/g)).toHaveLength(3);
  });

  it('uses an em dash, not a hyphen, in the page heading', async () => {
    const html = await render(About);
    const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '';

    expect(heading).toContain('— A bit about me');
    expect(heading).not.toContain('- A bit about me');
  });
});

describe('resume page', () => {
  it('gives each employer a heading under "Experience"', async () => {
    const html = await render(Resume);

    expect(html.match(/<h3[^>]*class="work-company"/g)).toHaveLength(resume.work.length);
  });

  it('hides the decorative · separators from screen readers', async () => {
    const html = await render(Resume);
    const separators = html.match(/<span[^>]*class="sep"[^>]*>/g) ?? [];

    expect(separators.length).toBeGreaterThan(0);
    for (const tag of separators) {
      expect(tag).toContain('aria-hidden="true"');
    }
  });
});

describe('blog index', () => {
  it('does not nest <time> elements', async () => {
    const html = await render(BlogIndex);

    expect(html).not.toMatch(/<time[^>]*>(?:(?!<\/time>)[\s\S])*<time/);
  });

  it('loads the first thumbnail eagerly and the rest lazily', async () => {
    const html = await render(BlogIndex);
    const thumbs = html.match(/<img[^>]*class="post-image"[^>]*>/g) ?? [];

    expect(thumbs.length).toBeGreaterThan(1);
    expect(thumbs[0]).toContain('loading="eager"');
    for (const tag of thumbs.slice(1)) {
      expect(tag).toContain('loading="lazy"');
    }
  });

  it('uses a typographic apostrophe in the heading', async () => {
    const html = await render(BlogIndex);

    expect(html).toContain('What I’m thinking and building');
  });
});

describe('home page', () => {
  it('uses a typographic apostrophe in the feeds heading', async () => {
    const html = await render(Home);

    expect(html).toContain('What I’ve been up to');
  });
});
