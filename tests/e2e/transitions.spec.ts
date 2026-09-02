import { expect, test, type Page } from '@playwright/test';

/**
 * The page-level transition is scoped by Astro's `transition:animate` on <html>,
 * so its pseudo-element carries a generated name (`astro-<hash>`) rather than
 * `root`. Match on shape and exclude the named element transitions — the wordmark
 * legitimately cross-fades, but it is the same glyphs in the same place, so it
 * cannot produce the doubled text this suite is guarding against.
 */
const NAMED_ELEMENT_SCOPES = ['wordmark'];

const scopeOf = (pseudo: string) =>
  pseudo.match(/^::view-transition-(?:old|new)\((.+)\)$/)?.[1] ?? '';

const isPageOld = (pseudo: string) =>
  pseudo.startsWith('::view-transition-old(') &&
  !NAMED_ELEMENT_SCOPES.includes(scopeOf(pseudo));

const isPageNew = (pseudo: string) =>
  pseudo.startsWith('::view-transition-new(') &&
  !NAMED_ELEMENT_SCOPES.includes(scopeOf(pseudo));

interface AnimationSample {
  pseudo: string;
  name: string;
  delayMs: number;
  durationMs: number;
}

/**
 * Slows every animation 20x so the transition can be sampled reliably, clicks a
 * nav link, and reports the animations running on the root snapshot pseudo-elements.
 */
async function sampleRootTransition(
  page: Page,
  linkName: string,
): Promise<AnimationSample[]> {
  // Astro's viewtransitions.css disables every view transition under
  // `prefers-reduced-motion`, which would make these assertions vacuous.
  // Playwright defaults to 'no-preference'; fail loudly if that ever changes.
  const prefersReducedMotion = await page.evaluate(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  expect(
    prefersReducedMotion,
    'view transitions are disabled under prefers-reduced-motion, so this test needs motion enabled',
  ).toBe(false);

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.05 });

  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: linkName })
    .click();

  // 1200ms at 0.05x ≈ 60ms of transition time — well inside any sane transition.
  await page.waitForTimeout(1200);

  return page.evaluate(() =>
    document
      .getAnimations()
      .map((animation) => ({
        animation,
        // pseudoElement lives on KeyframeEffect, not the AnimationEffect base type.
        effect: animation.effect as KeyframeEffect | null,
      }))
      .filter(({ effect }) => (effect?.pseudoElement ?? '').startsWith('::view-transition'))
      .map(({ animation, effect }) => {
        const timing = effect?.getTiming?.() ?? {};
        return {
          pseudo: effect?.pseudoElement ?? '',
          name: (animation as CSSAnimation).animationName ?? '',
          delayMs: Number(timing.delay ?? 0),
          durationMs: Number(timing.duration ?? 0),
        };
      }),
  );
}

test.describe('client-side page transitions', () => {
  test('old and new page content never fade at the same time', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('load');

    const animations = await sampleRootTransition(page, 'Work');

    const outgoing = animations.filter((a) => isPageOld(a.pseudo));
    const incoming = animations.filter((a) => isPageNew(a.pseudo));

    // The outgoing page must actually animate away rather than being cut.
    expect(outgoing.length).toBeGreaterThan(0);

    // Outgoing is visible from 0 until its animation ends.
    const outgoingEndsAt = Math.max(
      ...outgoing.map((a) => a.delayMs + a.durationMs),
    );

    // Incoming is transparent until its fade-in starts. With no animation at all
    // it is opaque for the whole transition, i.e. it overlaps from t=0.
    const incomingStartsAt = incoming.length
      ? Math.min(...incoming.map((a) => a.delayMs))
      : 0;

    expect(
      incomingStartsAt,
      `incoming page starts at ${incomingStartsAt}ms but outgoing page is still visible until ${outgoingEndsAt}ms — the two pages' text overlaps for ${outgoingEndsAt - incomingStartsAt}ms`,
    ).toBeGreaterThanOrEqual(outgoingEndsAt);
  });

  test('root snapshots do not use additive plus-lighter blending', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('load');

    const animations = await sampleRootTransition(page, 'Work');

    // The UA default blends old and new additively, which makes both pages'
    // light text fully legible at once against the dark background.
    const blended = animations.filter(
      (a) =>
        (isPageOld(a.pseudo) || isPageNew(a.pseudo)) &&
        a.name.includes('plus-lighter'),
    );

    expect(
      blended,
      `plus-lighter blending still active on: ${blended.map((b) => b.pseudo).join(', ')}`,
    ).toHaveLength(0);
  });
});

test.describe('header position stability', () => {
  // Tall enough that /about fits without scrolling while the other pages do not.
  // The header is max-width:1240px + margin:0 auto, so a scrollbar that comes and
  // goes moves the centered content by half the scrollbar width on every hop.
  test.use({ viewport: { width: 1280, height: 1000 } });

  test('nav and wordmark sit at the same x whether or not the page scrolls', async ({
    page,
  }) => {
    const measurements = [];

    for (const path of ['/about', '/work', '/', '/resume']) {
      await page.goto(path);
      await page.waitForLoadState('load');
      measurements.push({
        path,
        ...(await page.evaluate(() => {
          const left = (selector: string) =>
            Math.round(
              (document.querySelector(selector)?.getBoundingClientRect().left ?? NaN) * 10,
            ) / 10;
          return {
            navLeft: left('.dark-nav'),
            wordmarkLeft: left('.dark-wordmark'),
            scrollbarPx: window.innerWidth - document.documentElement.clientWidth,
            scrolls: document.documentElement.scrollHeight > window.innerHeight,
          };
        })),
      });
    }

    // Guard against a vacuous pass: this only proves anything if the set of pages
    // genuinely mixes scrolling and non-scrolling ones at this viewport.
    const scrollStates = new Set(measurements.map((m) => m.scrolls));
    expect(
      scrollStates.size,
      `expected a mix of scrolling and non-scrolling pages, got ${JSON.stringify(measurements)}`,
    ).toBe(2);

    // Headless Chromium hides scrollbars, so they occupy no width and the shift
    // this test exists to catch cannot occur. Skip loudly rather than pass green;
    // run `playwright test --headed` (or any environment with classic scrollbars)
    // for real coverage. The CSS-level guard lives in the BaseLayout unit test.
    const hasClassicScrollbars = measurements.some(
      (m) => m.scrolls && m.scrollbarPx > 0,
    );
    test.skip(
      !hasClassicScrollbars,
      'scrollbars take no width here (headless); nothing can shift',
    );

    const detail = JSON.stringify(measurements, null, 2);
    expect(
      new Set(measurements.map((m) => m.navLeft)).size,
      `nav shifts horizontally between pages:\n${detail}`,
    ).toBe(1);
    expect(
      new Set(measurements.map((m) => m.wordmarkLeft)).size,
      `wordmark shifts horizontally between pages:\n${detail}`,
    ).toBe(1);
  });
});
