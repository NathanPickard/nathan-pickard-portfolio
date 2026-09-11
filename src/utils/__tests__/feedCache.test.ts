import { describe, expect, it } from 'vitest';
import {
  FEED_CACHE_TTL_MS,
  readFeedCache,
  writeFeedCache,
  type StorageLike,
} from '../feedCache';

function makeStorage(initial: Record<string, string> = {}): StorageLike & {
  store: Map<string, string>;
} {
  const store = new Map(Object.entries(initial));
  return {
    store,
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

const NOW = 1_700_000_000_000;

describe('readFeedCache', () => {
  it('returns the cached data when the entry is inside the TTL', () => {
    const storage = makeStorage({
      'feed:a': JSON.stringify({ t: NOW - 1000, data: { posts: [1, 2] } }),
    });

    const result = readFeedCache<{ posts: number[] }>('feed:a', storage, NOW);

    expect(result).toEqual({ posts: [1, 2] });
  });

  it('returns null when the entry is older than the TTL', () => {
    const storage = makeStorage({
      'feed:a': JSON.stringify({
        t: NOW - FEED_CACHE_TTL_MS - 1,
        data: { posts: [] },
      }),
    });

    expect(readFeedCache('feed:a', storage, NOW)).toBeNull();
  });

  it('returns null when there is no entry for the key', () => {
    expect(readFeedCache('missing', makeStorage(), NOW)).toBeNull();
  });

  it('returns null when the stored value is not valid JSON', () => {
    const storage = makeStorage({ 'feed:a': '{not json' });

    expect(readFeedCache('feed:a', storage, NOW)).toBeNull();
  });

  it('returns null when the stored value has the wrong shape', () => {
    const storage = makeStorage({ 'feed:a': JSON.stringify({ nope: true }) });

    expect(readFeedCache('feed:a', storage, NOW)).toBeNull();
  });

  it('returns null when storage throws', () => {
    const storage: StorageLike = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {},
    };

    expect(readFeedCache('feed:a', storage, NOW)).toBeNull();
  });

  it('returns null when storage is unavailable', () => {
    expect(readFeedCache('feed:a', undefined, NOW)).toBeNull();
  });
});

describe('writeFeedCache', () => {
  it('stores the data with the current timestamp', () => {
    const storage = makeStorage();

    writeFeedCache('feed:a', { posts: [1] }, storage, NOW);

    expect(JSON.parse(storage.store.get('feed:a')!)).toEqual({
      t: NOW,
      data: { posts: [1] },
    });
  });

  it('round-trips through readFeedCache', () => {
    const storage = makeStorage();

    writeFeedCache('feed:a', { cursor: 'abc' }, storage, NOW);

    expect(readFeedCache('feed:a', storage, NOW + 1000)).toEqual({
      cursor: 'abc',
    });
  });

  it('does not throw when storage throws', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    };

    expect(() => writeFeedCache('feed:a', {}, storage, NOW)).not.toThrow();
  });

  it('does not throw when storage is unavailable', () => {
    expect(() => writeFeedCache('feed:a', {}, undefined, NOW)).not.toThrow();
  });
});
