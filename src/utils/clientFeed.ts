/**
 * Shared load lifecycle for the client-side social feeds (Bluesky, GitHub).
 *
 * Each feed section on the page goes through the same steps: skip if already
 * loading or loaded, paint from the session cache when possible, otherwise
 * fetch the first page, then either paint it, show an empty message, or show
 * an error. Feeds supply the fetch and paint functions; this module owns the
 * state machine and the status/list visibility toggling.
 *
 * Feed markup must include `[data-feed-status]` for the message element and
 * `[data-feed-list]` for the list the feed paints into.
 */
import { readFeedCache, writeFeedCache } from './feedCache';

export interface FeedDefinition<TPage> {
  /** Selector matching every section this feed should load. */
  selector: string;
  /** Prefix for console warnings. */
  name: string;
  cacheKey: (section: HTMLElement) => string;
  fetchFirstPage: (section: HTMLElement) => Promise<TPage>;
  isEmpty: (page: TPage) => boolean;
  paint: (section: HTMLElement, page: TPage) => void;
  emptyMessage: string;
  errorMessage: string;
}

const SHORT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

/** "Sep 18, 2026" style date used on feed cards. */
export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', SHORT_DATE_FORMAT);
}

function statusElement(section: HTMLElement): HTMLElement | null {
  return section.querySelector<HTMLElement>('[data-feed-status]');
}

function listElement(section: HTMLElement): HTMLElement | null {
  return section.querySelector<HTMLElement>('[data-feed-list]');
}

/** Hides the list and shows `message` in the status element. */
export function showFeedStatus(section: HTMLElement, message: string): void {
  const list = listElement(section);
  const status = statusElement(section);
  if (list) list.hidden = true;
  if (status) {
    status.hidden = false;
    status.textContent = message;
  }
}

/** Shows the list and hides the status element. */
export function showFeedList(section: HTMLElement): void {
  const list = listElement(section);
  const status = statusElement(section);
  if (list) list.hidden = false;
  if (status) status.hidden = true;
}

/** Runs the load lifecycle for one feed section. Safe to call repeatedly. */
export async function loadFeed<TPage>(
  section: HTMLElement,
  feed: FeedDefinition<TPage>,
): Promise<void> {
  const state = section.dataset.feedState;
  if (state === 'loading' || state === 'loaded') return;
  section.dataset.feedState = 'loading';

  const cacheKey = feed.cacheKey(section);

  // Session cache so revisits (incl. View Transition navigations) are instant.
  const cached = readFeedCache<TPage>(cacheKey);
  if (cached) {
    feed.paint(section, cached);
    section.dataset.feedState = 'loaded';
    return;
  }

  try {
    const page = await feed.fetchFirstPage(section);
    if (feed.isEmpty(page)) {
      showFeedStatus(section, feed.emptyMessage);
    } else {
      writeFeedCache(cacheKey, page);
      feed.paint(section, page);
    }
    section.dataset.feedState = 'loaded';
  } catch (err) {
    console.warn(`${feed.name}: fetch failed`, err);
    showFeedStatus(section, feed.errorMessage);
    section.dataset.feedState = '';
  }
}

/**
 * Loads every matching section on first load and after each View Transition
 * navigation (`astro:page-load` fires for both).
 */
export function registerFeed<TPage>(feed: FeedDefinition<TPage>): void {
  document.addEventListener('astro:page-load', () => {
    document
      .querySelectorAll<HTMLElement>(feed.selector)
      .forEach((section) => loadFeed(section, feed));
  });
}
