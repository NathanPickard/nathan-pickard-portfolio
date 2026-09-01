import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BaseLayout from '../BaseLayout.astro';

const LAYOUT_SOURCE_PATH = fileURLToPath(
  new URL('../BaseLayout.astro', import.meta.url),
);

async function renderBaseLayout() {
  const container = await AstroContainer.create();
  return container.renderToString(BaseLayout, {
    props: { title: 'Test page' },
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
