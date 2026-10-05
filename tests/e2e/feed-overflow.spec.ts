import { expect, test, type Page } from '@playwright/test';

/**
 * Each feed scrolls inside a fixed-height box. The screen-reader labels on the
 * post and repo counts are absolutely positioned (.visually-hidden), so unless
 * the scroll box is their containing block they escape its clipping and
 * stretch the page far past the footer.
 */

/** Pixels of rounding slack between the page's scroll height and the footer. */
const SUBPIXEL_TOLERANCE = 1;

const bskyPost = (i: number) => ({
  post: {
    uri: `at://did:plc:example/app.bsky.feed.post/p${i}`,
    record: {
      text: `Post number ${i} with enough words to take up a couple of lines in the feed card.`,
      createdAt: '2026-09-01T12:00:00.000Z',
    },
    replyCount: i,
    repostCount: i + 1,
    likeCount: i + 2,
  },
});

const repo = (i: number) => ({
  name: `repository-with-a-long-name-${i}`,
  description:
    'A description long enough to wrap onto a second line on a phone-width screen, then get clamped.',
  html_url: `https://github.com/example/repo-${i}`,
  language: 'TypeScript',
  stargazers_count: i + 1,
  pushed_at: '2026-09-01T00:00:00Z',
  fork: false,
  archived: false,
});

async function mockFeeds(page: Page, postCount: number): Promise<void> {
  await page.route('**/app.bsky.feed.getAuthorFeed**', (route) =>
    // No cursor, so the feed does not try to load a second page.
    route.fulfill({ json: { feed: Array.from({ length: postCount }, (_, i) => bskyPost(i)) } }),
  );
  await page.route('https://api.github.com/**', (route) =>
    route.fulfill({ json: Array.from({ length: 5 }, (_, i) => repo(i)) }),
  );
}

async function waitForFeeds(page: Page): Promise<void> {
  await expect(page.locator('.bluesky-feed')).toHaveAttribute('data-feed-state', 'loaded');
  await expect(page.locator('.github-feed')).toHaveAttribute('data-feed-state', 'loaded');
}

/** How far the page scrolls past the bottom of the footer, in pixels. */
async function overflowPastFooter(page: Page): Promise<number> {
  return page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) throw new Error('footer not found');
    const footerBottom = footer.getBoundingClientRect().bottom + window.scrollY;
    return document.documentElement.scrollHeight - footerBottom;
  });
}

async function listOverflowsItsBox(page: Page, selector: string): Promise<boolean> {
  return page.locator(selector).evaluate((el) => el.scrollHeight > el.clientHeight);
}

/**
 * Screen-reader labels inside `boxSelector` that position against something
 * outside the box, and so escape its clipping. Labels in hidden elements are
 * skipped since they are not laid out.
 */
async function labelsEscapingBox(page: Page, boxSelector: string): Promise<number> {
  return page.locator(boxSelector).evaluate((box) => {
    const labels = [...box.querySelectorAll<HTMLElement>('.visually-hidden')].filter(
      (label) => !label.closest('[hidden]'),
    );
    if (labels.length === 0) throw new Error('no visible labels to check');
    return labels.filter((label) => !(label.offsetParent && box.contains(label.offsetParent)))
      .length;
  });
}

test.describe('feed scroll boxes', () => {
  test.beforeEach(async ({ page }) => {
    await mockFeeds(page, 10);
    await page.goto('/');
    await waitForFeeds(page);
  });

  test('a long Bluesky feed does not stretch the page past the footer', async ({ page }) => {
    expect(await listOverflowsItsBox(page, '.bluesky-feed .feed-scroll')).toBe(true);
    expect(await overflowPastFooter(page)).toBeLessThanOrEqual(SUBPIXEL_TOLERANCE);
  });

  test('Bluesky count labels stay inside the scroll box', async ({ page }) => {
    expect(await labelsEscapingBox(page, '.bluesky-feed .feed-scroll')).toBe(0);
  });

  test('GitHub star labels stay inside the scroll box', async ({ page }) => {
    expect(await labelsEscapingBox(page, '.github-feed .repo-grid')).toBe(0);
  });
});
