import { describe, expect, it } from 'vitest';
import { getCollection } from 'astro:content';
import { renderPostBody } from './helpers/renderPost';

/**
 * ```mermaid fences are turned into `<pre class="mermaid">` by remarkMermaid
 * (src/utils/remarkMermaid.ts) and drawn in the browser by the script in
 * BlogPost.astro. The source must reach the page untouched: Expressive Code
 * must not claim the block, and SmartyPants must not turn `-->>` into dashes.
 */

// Captures the fence's indent so fences nested inside list items match too.
const MERMAID_FENCE = /^([ \t]*)```mermaid[^\n]*\n([\s\S]*?)^\1```/gm;

function dedent(body: string, indent: string): string {
  return body
    .split('\n')
    .map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
    .join('\n');
}

function fenceBodies(markdown: string): string[] {
  return [...markdown.matchAll(MERMAID_FENCE)].map(([, indent, body]) =>
    dedent(body, indent).trim()
  );
}

function decodeEntities(html: string): string {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function renderedDiagrams(html: string): string[] {
  return [...html.matchAll(/<pre class="mermaid"[^>]*>([\s\S]*?)<\/pre>/g)].map((match) =>
    decodeEntities(match[1]).trim()
  );
}

describe('Mermaid diagrams in blog posts', () => {
  it('passes every mermaid block to the page unchanged, as a diagram', async () => {
    const posts = await getCollection('blog');
    const withDiagrams = posts.filter((post) => fenceBodies(post.body ?? '').length > 0);

    expect(withDiagrams.length).toBeGreaterThan(0);

    for (const post of withDiagrams) {
      const html = await renderPostBody(post);

      expect(renderedDiagrams(html), post.id).toEqual(fenceBodies(post.body ?? ''));
      expect(html, post.id).not.toContain('data-language="mermaid"');
    }
  });
});
