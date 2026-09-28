import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import BlogPost from '../../layouts/BlogPost.astro';
import About from '../about.astro';
import BlogArchived from '../blog/archived.astro';
import BlogIndex from '../blog/index.astro';
import Home from '../index.astro';
import Resume from '../resume.astro';
import Work from '../work.astro';

/**
 * BaseLayout's "Skip to content" link points at #main-content, but each page
 * renders its own <main>. Every page must give that <main> the id, or the link
 * goes nowhere.
 */
const PAGES: [string, AstroComponentFactory, Record<string, unknown>][] = [
  ['home', Home, {}],
  ['about', About, {}],
  ['work', Work, {}],
  ['resume', Resume, {}],
  ['blog index', BlogIndex, {}],
  ['archived posts', BlogArchived, {}],
  ['blog post', BlogPost, { title: 'Post', description: 'Desc', pubDate: new Date('2026-01-01') }],
];

describe('skip link target', () => {
  it.each(PAGES)('%s has exactly one <main id="main-content">', async (_name, page, props) => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(page, { props });

    expect(html.match(/<main[^>]*\bid="main-content"/g)).toHaveLength(1);
  });
});
