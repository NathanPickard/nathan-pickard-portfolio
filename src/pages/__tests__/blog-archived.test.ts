import { describe, expect, it, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import heroImage from '../../assets/blog-placeholder-2.jpg';
import Archived from '../blog/archived.astro';

/**
 * Every archived post currently has a hero image, so the real collection can't
 * exercise the no-image case. The collection is mocked with one post of each.
 */
vi.mock('astro:content', () => ({
  getCollection: async () => [
    {
      id: 'with-hero',
      data: { title: 'With hero', pubDate: new Date('2018-01-11'), archived: true, heroImage },
    },
    {
      id: 'without-hero',
      data: { title: 'Without hero', pubDate: new Date('2017-11-12'), archived: true },
    },
  ],
}));

async function renderArchived(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Archived);
}

/** Splits the rendered list into one HTML chunk per post row. */
function rows(html: string): string[] {
  return html.split(/<a [^>]*class="post-row"/).slice(1);
}

describe('archived posts layout', () => {
  it('renders one row per archived post', async () => {
    const html = await renderArchived();

    expect(rows(html)).toHaveLength(2);
  });

  // The row is a three-column grid (thumbnail, text, arrow). If a row skips the
  // thumbnail, the text and arrow slide one column left and the row breaks.
  it('fills the thumbnail column in every row, with or without a hero image', async () => {
    const html = await renderArchived();

    for (const row of rows(html)) {
      expect(row).toMatch(/class="post-thumb[\s"]/);
    }
  });

  it('uses a placeholder, not an image, when a post has no hero image', async () => {
    const html = await renderArchived();
    const withoutHero = rows(html).find((row) => row.includes('Without hero'));

    expect(withoutHero).toMatch(/<div[^>]*class="post-thumb post-thumb--placeholder"/);
    expect(withoutHero).not.toMatch(/<img/);
  });
});
