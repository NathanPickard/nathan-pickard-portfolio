/**
 * Remark plugin: turns ```mermaid code fences into `<pre class="mermaid">`,
 * which the script in BlogPost.astro renders to an SVG in the browser.
 *
 * The diagram source is carried in `data.hChildren` (hast), not as an mdast
 * text node, so later remark plugins such as SmartyPants never see it and
 * cannot turn `-->>` into dashes. The resulting `<pre>` has no `<code>` child,
 * so Expressive Code leaves it alone too.
 */

import type { Root } from 'mdast';

interface MdNode {
  type: string;
  lang?: string | null;
  value?: string;
  children?: MdNode[];
  data?: object;
}

function toDiagram(source: string): MdNode {
  return {
    type: 'mermaidDiagram',
    data: {
      hName: 'pre',
      hProperties: { className: ['mermaid'] },
      hChildren: [{ type: 'text', value: source }],
    },
  };
}

function transform(node: MdNode): MdNode {
  if (node.type === 'code' && node.lang === 'mermaid') {
    return toDiagram(node.value ?? '');
  }
  if (!node.children) {
    return node;
  }
  return { ...node, children: node.children.map(transform) };
}

export function remarkMermaid() {
  // The diagram node is not a standard mdast type, hence the cast back to Root.
  return (tree: Root): Root => transform(tree) as Root;
}
