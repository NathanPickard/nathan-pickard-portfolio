/**
 * Session-scoped cache for the client-side social feeds (Bluesky, GitHub).
 *
 * Revisits within a session, including View Transition navigations back to
 * the homepage, paint instantly from cache instead of hitting the public APIs
 * again. Entries expire after FEED_CACHE_TTL_MS so a long-lived tab still
 * refreshes.
 *
 * Storage is injectable so the helper can be unit-tested in Node, where
 * `sessionStorage` does not exist.
 */

export const FEED_CACHE_TTL_MS = 30 * 60 * 1000;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface CacheEntry<T> {
  t: number;
  data: T;
}

function defaultStorage(): StorageLike | undefined {
  try {
    return globalThis.sessionStorage;
  } catch {
    // Some browsers throw on access when site data is blocked.
    return undefined;
  }
}

function isCacheEntry<T>(value: unknown): value is CacheEntry<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as CacheEntry<T>).t === 'number' &&
    'data' in value
  );
}

/** Returns the cached payload for `key`, or null if missing, expired, or unreadable. */
export function readFeedCache<T>(
  key: string,
  storage: StorageLike | undefined = defaultStorage(),
  now: number = Date.now(),
): T | null {
  if (!storage) return null;

  try {
    const raw = storage.getItem(key);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isCacheEntry<T>(parsed)) return null;
    if (now - parsed.t >= FEED_CACHE_TTL_MS) return null;

    return parsed.data;
  } catch {
    // Malformed JSON or blocked storage: treat as a cache miss.
    return null;
  }
}

/** Stores `data` under `key` with the current timestamp. Never throws. */
export function writeFeedCache<T>(
  key: string,
  data: T,
  storage: StorageLike | undefined = defaultStorage(),
  now: number = Date.now(),
): void {
  if (!storage) return;

  try {
    const entry: CacheEntry<T> = { t: now, data };
    storage.setItem(key, JSON.stringify(entry));
  } catch {
    // Quota exceeded or storage blocked: caching is best-effort.
  }
}
