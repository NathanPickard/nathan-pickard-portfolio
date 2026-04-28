import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import WorkPage from '../work.astro';

async function renderWorkPage() {
  const container = await AstroContainer.create();
  return container.renderToString(WorkPage);
}

describe('work.astro skills panels', () => {
  it('renders expected skills section headings and panel labels', async () => {
    const html = await renderWorkPage();

    expect(html).toContain('Technical Skills');
    expect(html).toContain('The tools I reach for');

    expect(html).toContain('FRONTEND');
    expect(html).toContain('BACKEND');
    expect(html).toContain('DEVOPS &amp; INFRASTRUCTURE');
    expect(html).toContain('TESTING');
    expect(html).toContain('SPECIALIZATIONS');
    expect(html).toContain('AI &amp; TOOLS');
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
