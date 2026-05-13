import { describe, expect, it } from 'vitest';
import { getCollection } from 'astro:content';

describe('blog collection schema integration', () => {
  it('loads blog collection entries through Astro content config', async () => {
    const posts = await getCollection('blog');

    expect(posts.length).toBeGreaterThan(0);
  });

  it('ensures required frontmatter fields are present on every post', async () => {
    const posts = await getCollection('blog');

    for (const post of posts) {
      expect(typeof post.data.title).toBe('string');
      expect(post.data.title.length).toBeGreaterThan(0);

      expect(post.data.pubDate).toBeInstanceOf(Date);
      expect(Number.isNaN(post.data.pubDate.getTime())).toBe(false);
    }
  });

  it('validates optional fields when present', async () => {
    const posts = await getCollection('blog');

    for (const post of posts) {
      if (post.data.description !== undefined) {
        expect(typeof post.data.description).toBe('string');
      }

      if (post.data.updatedDate !== undefined) {
        expect(post.data.updatedDate).toBeInstanceOf(Date);
        expect(Number.isNaN(post.data.updatedDate.getTime())).toBe(false);
      }

      if (post.data.archived !== undefined) {
        expect(typeof post.data.archived).toBe('boolean');
      }

      if (post.data.heroImage !== undefined) {
        expect(typeof post.data.heroImage).toBe('object');
      }
    }
  });
});
