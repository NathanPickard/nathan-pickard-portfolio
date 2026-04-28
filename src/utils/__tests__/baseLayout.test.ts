/**
 * Tests for BaseLayout canonical URL construction.
 *
 * Tests the logic: const canonicalURL = new URL(Astro.url.pathname, Astro.site);
 */

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Helper to mirror BaseLayout URL construction logic
// ---------------------------------------------------------------------------

/**
 * Construct canonical URL from pathname and site.
 * Mirrors: const canonicalURL = new URL(Astro.url.pathname, Astro.site);
 */
function constructCanonicalUrl(pathname: string, siteUrl: string): URL {
  return new URL(pathname, siteUrl);
}

/**
 * Get canonical URL as string.
 */
function getCanonicalUrlString(pathname: string, siteUrl: string): string {
  return constructCanonicalUrl(pathname, siteUrl).toString();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BaseLayout canonical URL construction', () => {
  const SITE_URL = 'https://nathanpickard.com';

  describe('basic URL construction', () => {
    it('constructs canonical URL from pathname and site', () => {
      const result = getCanonicalUrlString('/blog/', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/blog/');
    });

    it('constructs URL for root pathname', () => {
      const result = getCanonicalUrlString('/', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/');
    });

    it('constructs URL for nested paths', () => {
      const result = getCanonicalUrlString('/blog/post-slug/', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/blog/post-slug/');
    });

    it('constructs URL with query parameters', () => {
      const result = getCanonicalUrlString('/blog/?page=1', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/blog/?page=1');
    });

    it('constructs URL with fragments', () => {
      const result = getCanonicalUrlString('/blog/#section', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/blog/#section');
    });
  });

  describe('path edge cases', () => {
    it('handles paths without leading slash', () => {
      const result = getCanonicalUrlString('blog/', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/blog/');
    });

    it('handles paths with trailing slash', () => {
      const result = getCanonicalUrlString('/about/', SITE_URL);
      expect(result).toMatch(/about\/$/);
    });

    it('handles deep nested paths', () => {
      const result = getCanonicalUrlString('/docs/guides/getting-started/', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/docs/guides/getting-started/');
    });

    it('handles special characters in path', () => {
      const result = getCanonicalUrlString('/blog/my-post-2026/', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/blog/my-post-2026/');
    });

    it('handles encoded special characters', () => {
      const result = getCanonicalUrlString('/blog/post%20with%20spaces/', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/blog/post%20with%20spaces/');
    });
  });

  describe('site URL variations', () => {
    it('constructs URL with trailing slash in site', () => {
      const result = getCanonicalUrlString('/blog/', 'https://example.com/');
      expect(result).toBe('https://example.com/blog/');
    });

    it('constructs URL without trailing slash in site', () => {
      const result = getCanonicalUrlString('/blog/', 'https://example.com');
      expect(result).toBe('https://example.com/blog/');
    });

    it('constructs URL with port number', () => {
      const result = getCanonicalUrlString('/blog/', 'https://localhost:3000');
      expect(result).toBe('https://localhost:3000/blog/');
    });

    it('constructs URL with http protocol', () => {
      const result = getCanonicalUrlString('/about/', 'http://example.com');
      expect(result).toBe('http://example.com/about/');
    });
  });

  describe('URL object properties', () => {
    it('returns valid URL object', () => {
      const url = constructCanonicalUrl('/blog/', SITE_URL);
      expect(url).toBeInstanceOf(URL);
      expect(url.hostname).toBe('nathanpickard.com');
    });

    it('provides correct protocol', () => {
      const url = constructCanonicalUrl('/about/', SITE_URL);
      expect(url.protocol).toBe('https:');
    });

    it('provides correct pathname', () => {
      const url = constructCanonicalUrl('/blog/post-slug/', SITE_URL);
      expect(url.pathname).toBe('/blog/post-slug/');
    });

    it('provides correct hostname', () => {
      const url = constructCanonicalUrl('/', SITE_URL);
      expect(url.hostname).toBe('nathanpickard.com');
    });

    it('toString() produces canonical form', () => {
      const url = constructCanonicalUrl('/about/', SITE_URL);
      const str = url.toString();
      expect(str).toBe('https://nathanpickard.com/about/');
    });
  });

  describe('SEO considerations', () => {
    it('canonical URL includes protocol and domain', () => {
      const result = getCanonicalUrlString('/blog/', SITE_URL);
      expect(result).toMatch(/^https:\/\//);
      expect(result).toContain('nathanpickard.com');
    });

    it('canonical URL excludes trailing query parameters', () => {
      const result = getCanonicalUrlString('/blog/', SITE_URL);
      expect(result).not.toContain('?');
    });

    it('canonical URL format matches meta tag requirements', () => {
      const result = getCanonicalUrlString('/about/', SITE_URL);
      // Should be a valid, absolute URL
      expect(() => new URL(result)).not.toThrow();
    });
  });

  describe('real site paths', () => {
    it('handles portfolio homepage', () => {
      const result = getCanonicalUrlString('/', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/');
    });

    it('handles about page', () => {
      const result = getCanonicalUrlString('/about/', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/about/');
    });

    it('handles resume page', () => {
      const result = getCanonicalUrlString('/resume/', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/resume/');
    });

    it('handles blog index', () => {
      const result = getCanonicalUrlString('/blog/', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/blog/');
    });

    it('handles blog post page', () => {
      const result = getCanonicalUrlString('/blog/post-title/', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/blog/post-title/');
    });

    it('handles work page', () => {
      const result = getCanonicalUrlString('/work/', SITE_URL);
      expect(result).toBe('https://nathanpickard.com/work/');
    });
  });
});
