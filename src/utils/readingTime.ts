/**
 * Remark plugin: estimates a post's reading time at build time and exposes it
 * as `minutesRead` on the `remarkPluginFrontmatter` that `render()` returns.
 *
 * Prose and code both count, since readers work through a post's code
 * examples too. Mermaid diagrams do not: their source is never shown as text.
 */

import type { Root } from 'mdast';

/** Average silent reading speed for English nonfiction (Brysbaert, 2019). */
export const WORDS_PER_MINUTE = 238;

// A token counts as a word only if it has a letter or digit, so code
// punctuation such as `=>` or `});` does not inflate the count.
const WORD_PATTERN = /[\p{L}\p{N}]/u;

// Node types whose text is not read. `mermaidDiagram` comes from
// remarkMermaid; the mdx* types are MDX imports, exports, and {expressions}.
const SKIPPED_TYPES = new Set([
  'mermaidDiagram',
  'html',
  'mdxjsEsm',
  'mdxFlowExpression',
  'mdxTextExpression',
]);

interface MdNode {
  type: string;
  value?: unknown;
  children?: MdNode[];
}

/** The part of Astro's VFile this plugin reads and writes. */
interface AstroFile {
  data: { astro?: { frontmatter?: Record<string, unknown> } };
}

function readableText(node: MdNode): string[] {
  if (SKIPPED_TYPES.has(node.type)) {
    return [];
  }
  if (typeof node.value === 'string') {
    return [node.value];
  }
  return (node.children ?? []).flatMap(readableText);
}

export function countWords(tree: Root): number {
  return readableText(tree)
    .join(' ')
    .split(/\s+/)
    .filter((token) => WORD_PATTERN.test(token)).length;
}

export function readingMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function remarkReadingTime() {
  return (tree: Root, file: AstroFile): void => {
    const astro = file.data.astro ?? {};
    const minutesRead = readingMinutes(countWords(tree));
    file.data.astro = { ...astro, frontmatter: { ...astro.frontmatter, minutesRead } };
  };
}
