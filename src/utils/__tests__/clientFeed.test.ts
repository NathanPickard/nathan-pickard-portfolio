import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatShortDate,
  loadFeed,
  showFeedList,
  showFeedStatus,
  type FeedDefinition,
} from '../clientFeed';

/**
 * Minimal stand-in for a feed <section>: just the dataset and the two
 * elements the lifecycle toggles. Avoids pulling a DOM into the test runner.
 */
function fakeSection(feedState = '') {
  const status = { hidden: false, textContent: 'Loading…' };
  const list = { hidden: true };
  const section = {
    dataset: { feedState } as Record<string, string>,
    querySelector: (selector: string) =>
      selector.includes('status') ? status : list,
  } as unknown as HTMLElement;
  return { section, status, list };
}

function fakeFeed(
  overrides: Partial<FeedDefinition<string[]>> = {},
): FeedDefinition<string[]> {
  return {
    selector: '.fake-feed',
    name: 'FakeFeed',
    cacheKey: () => 'fake-feed',
    fetchFirstPage: vi.fn(async () => ['a', 'b']),
    isEmpty: (page) => page.length === 0,
    paint: vi.fn(),
    emptyMessage: 'Nothing here.',
    errorMessage: 'Could not load.',
    ...overrides,
  };
}

describe('formatShortDate', () => {
  it('formats an ISO timestamp as a short US date', () => {
    expect(formatShortDate('2026-09-18T12:00:00Z')).toBe('Sep 18, 2026');
  });
});

describe('showFeedStatus / showFeedList', () => {
  it('shows the message and hides the list', () => {
    const { section, status, list } = fakeSection();

    showFeedStatus(section, 'Oops');

    expect(status).toEqual({ hidden: false, textContent: 'Oops' });
    expect(list.hidden).toBe(true);
  });

  it('shows the list and hides the status', () => {
    const { section, status, list } = fakeSection();

    showFeedList(section);

    expect(status.hidden).toBe(true);
    expect(list.hidden).toBe(false);
  });
});

describe('loadFeed', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches, paints, and marks the section loaded', async () => {
    const { section, status, list } = fakeSection();
    const feed = fakeFeed();

    await loadFeed(section, feed);

    expect(feed.fetchFirstPage).toHaveBeenCalledTimes(1);
    expect(feed.paint).toHaveBeenCalledWith(section, ['a', 'b']);
    expect(section.dataset.feedState).toBe('loaded');
    // paint() is the feed's job; the lifecycle leaves visibility to it.
    expect(status.hidden).toBe(false);
    expect(list.hidden).toBe(true);
  });

  it('skips sections that are already loading or loaded', async () => {
    const feed = fakeFeed();

    await loadFeed(fakeSection('loading').section, feed);
    await loadFeed(fakeSection('loaded').section, feed);

    expect(feed.fetchFirstPage).not.toHaveBeenCalled();
  });

  it('shows the empty message without painting when the page is empty', async () => {
    const { section, status } = fakeSection();
    const feed = fakeFeed({ fetchFirstPage: vi.fn(async () => []) });

    await loadFeed(section, feed);

    expect(feed.paint).not.toHaveBeenCalled();
    expect(status.textContent).toBe('Nothing here.');
    expect(section.dataset.feedState).toBe('loaded');
  });

  it('shows the error message and resets state so a later visit retries', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { section, status } = fakeSection();
    const feed = fakeFeed({
      fetchFirstPage: vi.fn(async () => {
        throw new Error('boom');
      }),
    });

    await loadFeed(section, feed);

    expect(feed.paint).not.toHaveBeenCalled();
    expect(status.textContent).toBe('Could not load.');
    expect(section.dataset.feedState).toBe('');
    expect(console.warn).toHaveBeenCalledWith(
      'FakeFeed: fetch failed',
      expect.any(Error),
    );
  });
});
