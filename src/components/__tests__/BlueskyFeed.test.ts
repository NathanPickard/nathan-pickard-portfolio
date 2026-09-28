import { afterEach, describe, expect, it, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BlueskyFeed from '../BlueskyFeed.astro';

async function renderBlueskyFeed() {
  const container = await AstroContainer.create();
  return container.renderToString(BlueskyFeed);
}

/**
 * The feed is fetched in the browser on every visit (same pattern as
 * GitHubFeed) so it never goes stale between Netlify builds. Rendering the
 * component must therefore make no network request at build time.
 */
describe('BlueskyFeed.astro client-side loading', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not fetch from the Bluesky API at render time', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    await renderBlueskyFeed();

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders a loading status and an empty list for the script to fill', async () => {
    const html = await renderBlueskyFeed();

    expect(html).toMatch(/data-feed-status[^>]*>Loading posts/);
    expect(html).toMatch(/<ul[^>]*class="posts"[^>]*hidden/);
    expect(html).not.toContain('class="post-link" href=');
  });

  it('announces status changes (loading, error, empty) to screen readers', async () => {
    const html = await renderBlueskyFeed();

    expect(html).toMatch(/<p[^>]*role="status"[^>]*data-feed-status|<p[^>]*data-feed-status[^>]*role="status"/);
  });

  it('uses a real ellipsis in loading text', async () => {
    const html = await renderBlueskyFeed();

    expect(html).not.toContain('Loading...');
  });

  it('uses a typographic apostrophe in the end-of-feed message', async () => {
    const html = await renderBlueskyFeed();

    expect(html).toContain('You’re all caught up.');
  });

  // The icons are aria-hidden and `title` is not reliably announced, so without
  // a text label a screen reader reads bare numbers ("12 4 30").
  it.each([
    ['stat-reply', 'replies'],
    ['stat-repost', 'reposts'],
    ['stat-like', 'likes'],
  ])('labels the %s count for screen readers as "%s"', async (statClass, label) => {
    const html = await renderBlueskyFeed();
    const stat = html.match(new RegExp(`class="stat ${statClass}"[\\s\\S]*?</span>\\s*</span>`))?.[0] ?? '';

    expect(stat).toMatch(new RegExp(`class="visually-hidden"[^>]*>${label}<`));
  });

  it('exposes the handle and page size for the client script', async () => {
    const html = await renderBlueskyFeed();

    expect(html).toContain('data-bluesky-handle="nathanpickard.bsky.social"');
    expect(html).toMatch(/data-feed-limit="\d+"/);
  });

  it('ships the post and image templates the client script clones', async () => {
    const html = await renderBlueskyFeed();

    expect(html).toMatch(/<template[^>]*class="post-template"/);
    expect(html).toMatch(/<template[^>]*class="post-image-template"/);
  });
});
