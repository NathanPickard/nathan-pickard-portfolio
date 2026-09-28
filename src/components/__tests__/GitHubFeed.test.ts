import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import GitHubFeed from '../GitHubFeed.astro';

async function renderGitHubFeed() {
  const container = await AstroContainer.create();
  return container.renderToString(GitHubFeed);
}

describe('GitHubFeed.astro', () => {
  it('announces status changes (loading, error, empty) to screen readers', async () => {
    const html = await renderGitHubFeed();

    expect(html).toMatch(/<p[^>]*role="status"[^>]*data-feed-status|<p[^>]*data-feed-status[^>]*role="status"/);
  });

  it('labels the star count for screen readers', async () => {
    const html = await renderGitHubFeed();
    const stars = html.match(/class="repo-stars"[\s\S]*?<\/span>\s*<\/span>/)?.[0] ?? '';

    expect(stars).toMatch(/class="visually-hidden"[^>]*>stars</);
  });
});
