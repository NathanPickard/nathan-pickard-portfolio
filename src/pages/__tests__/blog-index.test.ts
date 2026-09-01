import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getCollection } from 'astro:content';
import BlogIndex from '../blog/index.astro';

/**
 * Structural tests for the blog listing layout.
 *
 * These assert invariants of the side-thumbnail row layout rather than
 * specific post titles or dates, so publishing a new post cannot break them.
 */

async function renderBlogIndex(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(BlogIndex);
}

/** Count non-overlapping occurrences of a class attribute value. */
function countClass(html: string, className: string): number {
  const matches = html.match(new RegExp(`class="[^"]*\\b${className}\\b[^"]*"`, 'g'));
  return matches ? matches.length : 0;
}

describe('blog listing layout', () => {
  it('renders one row per published post', async () => {
    const html = await renderBlogIndex();
    const published = await getCollection('blog', ({ data }) => !data.archived);

    expect(published.length).toBeGreaterThan(0);
    expect(countClass(html, 'post-row')).toBe(published.length);
  });

  it('pairs every row with a thumbnail and a text block', async () => {
    const html = await renderBlogIndex();
    const rowCount = countClass(html, 'post-row');

    // The side-thumbnail layout puts the image and the text in sibling
    // containers, one of each per row.
    expect(countClass(html, 'post-thumb')).toBe(rowCount);
    expect(countClass(html, 'post-body')).toBe(rowCount);
  });

  it('omits the description paragraph for posts that have none', async () => {
    const html = await renderBlogIndex();
    const published = await getCollection('blog', ({ data }) => !data.archived);
    const withDescription = published.filter((post) => post.data.description);

    // Not every post has a description — the layout must not emit an empty one.
    expect(withDescription.length).toBeLessThan(published.length);
    expect(countClass(html, 'post-desc')).toBe(withDescription.length);
  });

  it('still renders a title for every post, described or not', async () => {
    const html = await renderBlogIndex();
    const rowCount = countClass(html, 'post-row');

    expect(countClass(html, 'post-title')).toBe(rowCount);
  });

  it('excludes archived posts', async () => {
    const html = await renderBlogIndex();
    const archived = await getCollection('blog', ({ data }) => data.archived === true);

    for (const post of archived) {
      expect(html).not.toContain(`/blog/${post.id}/`);
    }
  });
});
