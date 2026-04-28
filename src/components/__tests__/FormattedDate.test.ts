import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import FormattedDate from '../FormattedDate.astro';

async function renderFormattedDate(date: Date) {
  const container = await AstroContainer.create();
  return container.renderToString(FormattedDate, { props: { date } });
}

describe('FormattedDate.astro', () => {
  it('renders a time element with datetime attribute', async () => {
    const date = new Date('2026-04-27T12:00:00.000Z');
    const html = await renderFormattedDate(date);

    expect(html).toContain('datetime="2026-04-27T12:00:00.000Z"');
  });

  it('renders the expected readable date string', async () => {
    const date = new Date('2026-12-31T12:00:00.000Z');
    const html = await renderFormattedDate(date);

    expect(html).toContain('Dec 31, 2026');
  });
});
