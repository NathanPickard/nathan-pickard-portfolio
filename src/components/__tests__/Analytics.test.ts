import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Analytics from '../Analytics.astro';

const WEBSITE_ID = '00000000-0000-4000-8000-000000000000';
const DOMAIN = 'nathanpickard.com';

async function renderAnalytics(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(Analytics, { props });
}

function umamiScriptTag(html: string): string | undefined {
  return html.match(/<script[^>]*cloud\.umami\.is[^>]*>/)?.[0];
}

describe('Analytics.astro', () => {
  it('renders nothing when no website ID is configured', async () => {
    const html = await renderAnalytics({ domain: DOMAIN });

    expect(html.trim()).toBe('');
  });

  it('loads the Umami Cloud tracker for the configured website', async () => {
    const html = await renderAnalytics({ websiteId: WEBSITE_ID, domain: DOMAIN });
    const tag = umamiScriptTag(html);

    expect(tag, 'no Umami <script> rendered').toBeDefined();
    expect(tag).toContain('src="https://cloud.umami.is/script.js"');
    expect(tag).toContain(`data-website-id="${WEBSITE_ID}"`);
  });

  // Deferred so the tracker never blocks first paint.
  it('defers the tracker', async () => {
    const tag = umamiScriptTag(await renderAnalytics({ websiteId: WEBSITE_ID, domain: DOMAIN }));

    expect(tag).toMatch(/\sdefer[\s>]/);
  });

  // Netlify deploy previews and localhost run the same production build, so
  // only visits on the live domain should count.
  it('limits tracking to the live domain', async () => {
    const tag = umamiScriptTag(await renderAnalytics({ websiteId: WEBSITE_ID, domain: DOMAIN }));

    expect(tag).toContain(`data-domains="${DOMAIN}"`);
  });
});
