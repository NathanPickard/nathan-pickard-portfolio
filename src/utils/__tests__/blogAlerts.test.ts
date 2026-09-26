import { describe, expect, it } from 'vitest';
import { getCollection } from 'astro:content';
import { renderPostBody } from './helpers/renderPost';

/**
 * GitHub-style alerts (`> [!NOTE]` etc.) are turned into callouts by
 * remark-github-blockquote-alert, wired into `markdown.processor` in
 * astro.config.mjs. These tests render real posts so they cover both the .md
 * and .mdx pipelines as configured, not the plugin in isolation.
 */

const ALERT_MARKER = /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/gim;

function countAlerts(html: string): number {
  return (html.match(/class="markdown-alert markdown-alert-[a-z]+"/g) ?? []).length;
}

describe('GitHub-style alerts in blog posts', () => {
  it('renders every alert marker as a callout', async () => {
    const posts = await getCollection('blog');
    const withAlerts = posts.filter((post) => (post.body ?? '').match(ALERT_MARKER));

    expect(withAlerts.length).toBeGreaterThan(0);

    for (const post of withAlerts) {
      const markers = (post.body ?? '').match(ALERT_MARKER) ?? [];
      const html = await renderPostBody(post);

      expect(countAlerts(html), post.id).toBe(markers.length);
      expect(html, post.id).not.toMatch(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/);
    }
  });
});
