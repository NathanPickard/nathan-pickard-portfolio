import { expect, test } from '@playwright/test';

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const FIRST_PAGE = {
  cursor: 'page-2',
  feed: [
    {
      post: {
        uri: 'at://did:plc:example/app.bsky.feed.post/abc123',
        record: { text: 'A post with a wide photo', createdAt: '2026-09-01T12:00:00.000Z' },
        embed: {
          $type: 'app.bsky.embed.images#view',
          images: [
            {
              thumb: 'https://cdn.example.test/wide.png',
              alt: 'A wide photo',
              aspectRatio: { width: 1200, height: 600 },
            },
          ],
        },
        replyCount: 1,
        repostCount: 2,
        likeCount: 3,
      },
    },
  ],
};

test.describe('Bluesky feed', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://api.github.com/**', (route) => route.fulfill({ json: [] }));
    await page.route('https://cdn.example.test/**', (route) =>
      route.fulfill({ body: TINY_PNG, contentType: 'image/png' }),
    );
    await page.route('**/app.bsky.feed.getAuthorFeed**', (route) => {
      const isNextPage = new URL(route.request().url()).searchParams.has('cursor');
      return isNextPage ? route.fulfill({ status: 500 }) : route.fulfill({ json: FIRST_PAGE });
    });
  });

  test('reserves image space from the API aspect ratio', async ({ page }) => {
    await page.goto('/');
    const image = page.locator('.bluesky-feed .post-img').first();

    await expect(image).toHaveAttribute('width', '1200');
    await expect(image).toHaveAttribute('height', '600');
  });

  test('says so when loading more posts fails', async ({ page }) => {
    await page.goto('/');
    const end = page.locator('.bluesky-feed .feed-end');

    await expect(end).toBeVisible();
    await expect(end).toHaveText('Could not load more posts right now.');
  });
});
