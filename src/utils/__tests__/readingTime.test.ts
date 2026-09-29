import { describe, expect, it } from 'vitest';
import { getCollection, render } from 'astro:content';
import type { Root } from 'mdast';
import {
  WORDS_PER_MINUTE,
  countWords,
  readingMinutes,
  remarkReadingTime,
} from '../readingTime';

function words(count: number): string {
  return Array.from({ length: count }, () => 'word').join(' ');
}

const TREE: Root = {
  type: 'root',
  children: [
    { type: 'heading', depth: 2, children: [{ type: 'text', value: 'Two words' }] },
    {
      type: 'paragraph',
      children: [
        { type: 'text', value: 'Run ' },
        { type: 'inlineCode', value: 'npm test' },
        { type: 'text', value: ' and ' },
        { type: 'strong', children: [{ type: 'text', value: 'watch it fail.' }] },
      ],
    },
    { type: 'code', lang: 'ts', value: 'const skipped = "every word in a code block";' },
  ],
};

describe('readingMinutes', () => {
  it('rounds partial minutes up', () => {
    expect(readingMinutes(WORDS_PER_MINUTE)).toBe(1);
    expect(readingMinutes(WORDS_PER_MINUTE + 1)).toBe(2);
  });

  it('never reports less than one minute', () => {
    expect(readingMinutes(0)).toBe(1);
  });
});

describe('countWords', () => {
  it('counts headings, body text, inline code, and code blocks', () => {
    // "Two words" + "Run npm test and watch it fail."
    // + `const skipped "every word in a code block"`, without the "=".
    expect(countWords(TREE)).toBe(17);
  });

  it('does not count punctuation-only tokens as words', () => {
    const tree: Root = {
      type: 'root',
      children: [{ type: 'code', lang: 'ts', value: 'test("x", () => {\n});' }],
    };

    // Only `test("x",` has a letter; `()`, `=>`, `{`, and `});` do not.
    expect(countWords(tree)).toBe(1);
  });

  it('skips Mermaid diagrams', () => {
    const tree: Root = {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: 'Only these four words.' }] },
        // remarkMermaid's node: the source is in data.hChildren, not children.
        {
          type: 'mermaidDiagram',
          data: { hChildren: [{ type: 'text', value: words(50) }] },
        } as unknown as Root['children'][number],
      ],
    };

    expect(countWords(tree)).toBe(4);
  });
});

describe('remarkReadingTime', () => {
  it('adds minutesRead to the frontmatter Astro passes to the page', () => {
    const tree: Root = {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: words(WORDS_PER_MINUTE * 2 + 1) }] },
      ],
    };
    const file = { data: { astro: { frontmatter: { title: 'Kept' } } } };

    remarkReadingTime()(tree, file);

    expect(file.data.astro.frontmatter).toEqual({ title: 'Kept', minutesRead: 3 });
  });

  it('gives every blog post a reading time', async () => {
    const posts = await getCollection('blog');

    for (const post of posts) {
      const { remarkPluginFrontmatter } = await render(post);
      expect(remarkPluginFrontmatter.minutesRead, post.id).toBeGreaterThanOrEqual(1);
    }
  });
});
