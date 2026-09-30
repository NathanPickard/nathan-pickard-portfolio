import { describe, expect, it } from 'vitest';
import { getCollection } from 'astro:content';
import { GET } from '../rss.xml.js';

/**
 * Tests for the RSS feed.
 *
 * The GitHub profile README reads this feed to show the latest post, so the
 * feed must list published posts newest-first and leave out archived ones.
 */

const SITE = new URL('https://nathanpickard.com/');

async function renderFeed(): Promise<string> {
  const response = await GET({ site: SITE });
  return response.text();
}

function itemLinks(xml: string): string[] {
  return [...xml.matchAll(/<item>.*?<link>(.*?)<\/link>/gs)].map((match) => match[1]);
}

function itemPubDates(xml: string): number[] {
  return [...xml.matchAll(/<item>.*?<pubDate>(.*?)<\/pubDate>/gs)].map((match) =>
    Date.parse(match[1]),
  );
}

describe('RSS feed', () => {
  it('lists posts newest first', async () => {
    const xml = await renderFeed();
    const dates = itemPubDates(xml);
    const sorted = [...dates].sort((a, b) => b - a);

    expect(dates.length).toBeGreaterThan(1);
    expect(dates).toEqual(sorted);
  });

  it('includes one item per published post', async () => {
    const xml = await renderFeed();
    const published = await getCollection('blog', ({ data }) => !data.archived);

    expect(itemLinks(xml)).toHaveLength(published.length);
  });

  it('excludes archived posts', async () => {
    const xml = await renderFeed();
    const archived = await getCollection('blog', ({ data }) => data.archived === true);

    expect(archived.length).toBeGreaterThan(0);
    for (const post of archived) {
      expect(xml).not.toContain(`/blog/${post.id}/`);
    }
  });
});
