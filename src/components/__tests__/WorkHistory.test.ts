import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import WorkHistory from '../WorkHistory.astro';

async function renderWorkHistory() {
  const container = await AstroContainer.create();
  return container.renderToString(WorkHistory);
}

function openingTags(html: string, className: string): string[] {
  return html.match(new RegExp(`<[a-z]+[^>]*class="${className}[\\s"][^>]*>`, 'g')) ?? [];
}

describe('WorkHistory.astro markup', () => {
  // <button> may only contain phrasing content; a <div> inside is invalid HTML.
  it('puts only phrasing content inside tab and accordion buttons', async () => {
    const html = await renderWorkHistory();
    const buttonBodies = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((m) => m[1]);

    expect(buttonBodies.length).toBeGreaterThan(0);
    for (const body of buttonBodies) {
      expect(body).not.toMatch(/<div[\s>]/);
    }
  });

  // aria-label is ignored on an element with no role.
  it('gives the labeled mobile accordion wrapper a role', async () => {
    const html = await renderWorkHistory();
    const [wrapper] = openingTags(html, 'work-accordion');

    expect(wrapper).toMatch(/aria-label="Work history"/);
    expect(wrapper).toMatch(/role="[a-z]+"/);
  });
});

describe('WorkHistory.astro tabs keyboard model', () => {
  // Roving tabindex: Tab enters the tablist once, on the selected tab; arrow
  // keys move between tabs.
  it('keeps only the selected tab in the tab order', async () => {
    const html = await renderWorkHistory();
    const tabs = openingTags(html, 'work-tab');
    const selected = tabs.filter((tag) => tag.includes('aria-selected="true"'));
    const unselected = tabs.filter((tag) => tag.includes('aria-selected="false"'));

    expect(selected).toHaveLength(1);
    expect(selected[0]).not.toContain('tabindex="-1"');
    expect(unselected.length).toBeGreaterThan(0);
    for (const tag of unselected) {
      expect(tag).toContain('tabindex="-1"');
    }
  });
});
