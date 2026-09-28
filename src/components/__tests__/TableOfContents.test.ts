import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { MarkdownHeading } from 'astro';
import TableOfContents from '../TableOfContents.astro';

async function renderToc(headings: MarkdownHeading[]) {
  const container = await AstroContainer.create();
  return container.renderToString(TableOfContents, { props: { headings } });
}

const HEADINGS: MarkdownHeading[] = [
  { depth: 2, slug: 'first-some-thoughts', text: 'First, some thoughts' },
  { depth: 2, slug: 'my-ai-workflow', text: 'My AI workflow' },
  { depth: 3, slug: '1-planning', text: '1. Planning' },
  { depth: 3, slug: '2-developing', text: '2. Developing' },
  { depth: 4, slug: 'too-deep', text: 'Too deep' },
  { depth: 2, slug: 'summary', text: 'Summary' },
];

describe('TableOfContents.astro', () => {
  it('renders a labeled nav linking to each h2 and h3 by slug', async () => {
    const html = await renderToc(HEADINGS);

    expect(html).toMatch(/<nav[^>]*aria-label="Table of contents"/);
    expect(html).toContain('href="#first-some-thoughts"');
    expect(html).toContain('href="#1-planning"');
    expect(html).toContain('href="#summary"');
    expect(html).toContain('1. Planning');
  });

  it('nests h3 links under the h2 that precedes them', async () => {
    const html = await renderToc(HEADINGS);

    const workflowItem = html.slice(
      html.indexOf('href="#my-ai-workflow"'),
      html.indexOf('href="#summary"')
    );
    expect(workflowItem).toMatch(/<ul[^>]*>[\s\S]*href="#1-planning"[\s\S]*href="#2-developing"/);
  });

  it('leaves out headings deeper than h3', async () => {
    const html = await renderToc(HEADINGS);

    expect(html).not.toContain('too-deep');
  });

  it('renders nothing when there are no h2 headings', async () => {
    const html = await renderToc([{ depth: 3, slug: 'orphan', text: 'Orphan' }]);

    expect(html).not.toContain('<nav');
  });
});
