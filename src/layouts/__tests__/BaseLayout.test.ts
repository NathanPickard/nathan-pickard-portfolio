import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BaseLayout from '../BaseLayout.astro';

const LAYOUT_SOURCE_PATH = fileURLToPath(
  new URL('../BaseLayout.astro', import.meta.url),
);

async function renderBaseLayout(props: Record<string, unknown> = {}) {
  const container = await AstroContainer.create();
  return container.renderToString(BaseLayout, {
    props: { title: 'Test page', ...props },
    slots: { default: '<main data-reveal>Hidden until revealed</main>' },
  });
}

/**
 * Astro keeps HTML comments in its output, so markup that has been commented out
 * still appears in the rendered string. Without stripping them these assertions
 * happily match disabled CSS and report a false pass.
 */
function stripHtmlComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

/** Contents of every inline <style> in <head>, ignoring commented-out markup. */
function inlineHeadStyles(html: string): string[] {
  const head = stripHtmlComments(html.slice(0, html.indexOf('</head>')));
  return [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
}

describe('BaseLayout.astro scroll-reveal progressive enhancement', () => {
  it('marks the document as JS-capable with an inline script in <head>', async () => {
    const html = await renderBaseLayout();
    const head = html.slice(0, html.indexOf('</head>'));

    // Must be inline (not bundled/deferred) so the class exists before first paint.
    expect(head).toMatch(
      /<script>\s*document\.documentElement\.classList\.add\(["']js["']\)/,
    );
  });

  /**
   * The sequenced page transition is wired up with ClientRouter's
   * `transition:animate` on <html>; Astro turns that into a transition scope and
   * emits the matching ::view-transition rules inline in each page's HTML.
   * Without the scope attribute the directive is gone and the browser falls back
   * to its default cross-fade, which shows both pages' text at once.
   */
  it('gives <html> a transition scope so the sequenced animation is applied', async () => {
    const html = stripHtmlComments(await renderBaseLayout());
    const openingHtmlTag = html.match(/<html[^>]*>/)?.[0] ?? '';

    expect(
      openingHtmlTag,
      'the <html> element has no data-astro-transition-scope; is transition:animate still set?',
    ).toMatch(/data-astro-transition-scope="[^"]+"/);
  });

  /**
   * The keyframes named by that animation must be inline in <head>, deviating
   * from the docs' suggestion of `<style is:global>` on purpose. ClientRouter
   * swaps the head mid-navigation and the browser resolves the animation right
   * after; in dev, Vite serves global component styles as async <style> tags that
   * are briefly absent at exactly that moment. An animation naming missing
   * keyframes resolves to a no-op, leaving both snapshots opaque — the very
   * overlap this is meant to remove. Production was unaffected, so the e2e suite,
   * which runs against the build, could not catch it.
   */
  it('ships the transition keyframes inline in <head> so they survive the head swap', async () => {
    const html = await renderBaseLayout();
    const keyframeStyle = inlineHeadStyles(html).find((css) =>
      css.includes('@keyframes pageExit'),
    );

    expect(
      keyframeStyle,
      'no inline <style> in <head> defines the pageExit keyframes',
    ).toBeDefined();
    expect(keyframeStyle).toContain('@keyframes pageEnter');
  });

  /**
   * Short pages (/about) fit the viewport while the rest scroll, so an unreserved
   * scrollbar gutter shifts the centered header ~7.5px horizontally on every
   * navigation. The e2e check for this can only run where scrollbars take up
   * width — headless Chromium hides them — so assert the CSS itself here, where
   * the result does not depend on the browser's scrollbar style.
   */
  it('reserves the scrollbar gutter inline so the header cannot shift', async () => {
    const html = await renderBaseLayout();
    const gutterStyle = inlineHeadStyles(html).find((css) =>
      /scrollbar-gutter:\s*stable/.test(css),
    );

    expect(
      gutterStyle,
      'no inline <style> in <head> sets scrollbar-gutter: stable',
    ).toBeDefined();
    expect(gutterStyle).toMatch(/html\s*\{[^}]*scrollbar-gutter:\s*stable/);
  });

  /**
   * The background texture is rendered at low opacity behind a color-matrix
   * tint, so it needs very little fidelity. The JPEG source is converted to a
   * heavily compressed WebP at build time; the served URL must say so.
   */
  it('serves the background texture as a WebP', async () => {
    const html = stripHtmlComments(await renderBaseLayout());
    const textureHref = html.match(/<image[^>]*href="([^"]+)"/)?.[1];

    expect(textureHref, 'no <image> href found for the site texture').toBeDefined();
    // Builds emit a hashed `.webp` file; dev and test render through the
    // on-demand `/_image` endpoint, which carries the format as `f=webp`.
    const textureUrl = new URL(textureHref!.replaceAll('&amp;', '&'), 'http://localhost');
    const isWebp =
      textureUrl.pathname.endsWith('.webp') || textureUrl.searchParams.get('f') === 'webp';
    expect(isWebp, `texture is not served as WebP: ${textureHref}`).toBe(true);
  });

  it('only hides [data-reveal] content when the html.js class is present', async () => {
    const source = await readFile(LAYOUT_SOURCE_PATH, 'utf8');
    // Anchored to line start: the global block's tags sit at column 0, while any
    // other <style> (and any prose mentioning one) is indented inside the markup.
    const styleBlock =
      source.match(/^<style is:global>([\s\S]*?)^<\/style>/m)?.[1] ?? '';

    const hideRules = [...styleBlock.matchAll(/([^{}]*\[data-reveal\][^{}]*)\{[^}]*opacity:\s*0\s*;/g)]
      .map((m) => m[1].trim());

    // The rule that sets opacity: 0 must exist, and every such rule must be scoped to html.js.
    expect(hideRules.length).toBeGreaterThan(0);
    for (const selector of hideRules) {
      expect(selector).toMatch(/^html\.js\s+\[data-reveal\]/);
    }
  });
});

describe('BaseLayout.astro skip link', () => {
  it('makes a skip link to the main content the first link in <body>', async () => {
    const html = stripHtmlComments(await renderBaseLayout());
    const body = html.slice(html.indexOf('<body'));
    const firstLink = body.match(/<a\b[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';

    expect(firstLink).toMatch(/href="#main-content"/);
    expect(firstLink).toContain('Skip to content');
  });
});

describe('BaseLayout.astro dark theme hints', () => {
  function headOf(html: string): string {
    return stripHtmlComments(html.slice(0, html.indexOf('</head>')));
  }

  it('declares a dark color scheme so native controls and scrollbars render dark', async () => {
    const head = headOf(await renderBaseLayout());

    expect(head).toMatch(/<meta name="color-scheme" content="dark"/);
  });

  it('sets theme-color to the page background token', async () => {
    const head = headOf(await renderBaseLayout());
    const source = await readFile(LAYOUT_SOURCE_PATH, 'utf8');
    const background = source.match(/--color-bg:\s*(#[0-9a-fA-F]{6})/)?.[1];
    const themeColor = head.match(/<meta name="theme-color" content="([^"]+)"/)?.[1];

    expect(background, 'no --color-bg token found in BaseLayout.astro').toBeDefined();
    expect(themeColor?.toLowerCase()).toBe(background!.toLowerCase());
  });
});

describe('BaseLayout.astro background tree', () => {
  function treeClasses(html: string): string[] {
    const svgTag = html.match(/<svg[^>]*class="([^"]*site-topo[^"]*)"/)?.[1] ?? '';
    return svgTag.split(/\s+/);
  }

  it('lets a page with narrow content pull the tree closer to the text', async () => {
    const html = await renderBaseLayout({ narrowContent: true });

    expect(treeClasses(html)).toContain('is-beside-narrow-content');
  });

  it('keeps the tree beside the full reading width by default', async () => {
    const html = await renderBaseLayout();

    expect(treeClasses(html)).toContain('site-topo');
    expect(treeClasses(html)).not.toContain('is-beside-narrow-content');
  });
});
