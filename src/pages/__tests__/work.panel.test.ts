import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import WorkPage from '../work.astro';

async function renderWorkPage() {
  const container = await AstroContainer.create();
  return container.renderToString(WorkPage);
}

describe('work.astro default panel', () => {
  it('opens the Kellton panel by default on desktop tabs and mobile accordion', async () => {
    const html = await renderWorkPage();

    const kelltonIndex = 1;
    const harborIndex = 0;

    expect(html).toContain(
      `class="work-tab active" role="tab" aria-selected="true" aria-controls="panel-${kelltonIndex}"`,
    );
    expect(html).toContain(
      `class="work-tab" role="tab" aria-selected="false" aria-controls="panel-${harborIndex}"`,
    );
    expect(html).toContain(
      `class="work-panel active" role="tabpanel" id="panel-${kelltonIndex}"`,
    );
    expect(html).toContain(
      `class="accordion-trigger active" data-accordion-index="${kelltonIndex}" aria-expanded="true"`,
    );
    expect(html).toContain(
      `class="accordion-panel open" id="accordion-panel-${kelltonIndex}"`,
    );
    expect(html).not.toContain(
      `class="accordion-panel open" id="accordion-panel-${harborIndex}"`,
    );
  });
});

describe('work.astro skills panels', () => {
  it('renders expected skills section headings and panel labels', async () => {
    const html = await renderWorkPage();

    expect(html).toContain('The tools I reach for');

    expect(html).toContain('Frontend');
    expect(html).toContain('Backend');
    expect(html).toContain('DevOps &amp; Infrastructure');
    expect(html).toContain('Testing');
    expect(html).toContain('Specializations');
    expect(html).toContain('AI &amp; Tools');
  });

  it('renders expected panel ids and accent values from production config', async () => {
    const html = await renderWorkPage();

    expect(html).toContain('data-panel-id="frontend"');
    expect(html).toContain('data-panel-id="backend"');
    expect(html).toContain('data-panel-id="devops"');
    expect(html).toContain('data-panel-id="testing"');
    expect(html).toContain('data-panel-id="specializations"');
    expect(html).toContain('data-panel-id="ai-tools"');

    expect(html).toContain('--accent: #d4af37');
    expect(html).toContain('--accent: #b07fd4');
    expect(html).toContain('--accent: #f06292');
  });

  it('does not render skipped technologies in skill tiles', async () => {
    const html = await renderWorkPage();

    expect(html).not.toContain('Wordpress');
    expect(html).not.toContain('Less');
  });
});
