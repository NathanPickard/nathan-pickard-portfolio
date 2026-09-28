import { expect, test, type Page } from '@playwright/test';

// Every piece of text is set in one of the four type roles. The loaded faces
// get a hashed family name ("Source Serif 4-02d6…"), so match by prefix;
// --font-mono is a system stack whose first entry is ui-monospace.
const ROLE_FAMILY_PREFIXES = ['EB Garamond', 'Source Serif 4', 'DM Sans', 'ui-monospace'];
const MIN_TEXT_PX = 12;
const STATIC_PAGES = ['/', '/about', '/work', '/resume', '/blog', '/blog/archived'];
const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  phone: { width: 390, height: 844 },
};

interface RenderedText {
  where: string;
  family: string;
  sizePx: number;
}

/** Computed type of every rendered element that directly holds text, outside SVG. */
async function renderedText(page: Page): Promise<RenderedText[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter(
        (el) =>
          !el.closest('svg') &&
          el.getClientRects().length > 0 &&
          [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()),
      )
      .map((el) => {
        const style = getComputedStyle(el);
        const classes = [...el.classList].filter((c) => !c.startsWith('astro-')).join('.');
        return {
          where: `${el.tagName.toLowerCase()}${classes ? `.${classes}` : ''} "${el.textContent?.trim().slice(0, 24)}"`,
          family: style.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
          sizePx: parseFloat(style.fontSize),
        };
      }),
  );
}

async function newestPostPath(page: Page): Promise<string> {
  await page.goto('/blog');
  const href = await page.locator('.post-link').first().getAttribute('href');
  if (!href) throw new Error('No post link found on /blog');
  return href;
}

async function expectRoleTypography(page: Page, path: string): Promise<void> {
  await page.goto(path);
  // Mermaid swaps its source <pre> for an SVG after load; measure the final page.
  if ((await page.locator('pre.mermaid').count()) > 0) {
    await expect(page.locator('pre.mermaid svg').first()).toBeAttached();
  }
  const text = await renderedText(page);

  const offRole = text.filter((t) => !ROLE_FAMILY_PREFIXES.some((p) => t.family.startsWith(p)));
  const tooSmall = text.filter((t) => t.sizePx < MIN_TEXT_PX);

  expect.soft(offRole, 'text outside the four font roles').toEqual([]);
  expect.soft(tooSmall, `text smaller than ${MIN_TEXT_PX}px`).toEqual([]);
}

/** Newest post that has both section headings and subheadings to compare. */
async function postWithSubheadings(page: Page): Promise<string> {
  await page.goto('/blog');
  const hrefs = await page.locator('.post-link').evaluateAll((links) =>
    links.map((a) => a.getAttribute('href') ?? ''),
  );
  for (const href of hrefs) {
    await page.goto(href);
    if ((await page.locator('.prose h2').count()) > 0 && (await page.locator('.prose h3').count()) > 0) {
      return href;
    }
  }
  throw new Error('No blog post has both h2 and h3 headings');
}

/**
 * Rendered height of a lowercase "x". Heading and body faces differ a lot in
 * x-height, so font-size alone says little about how big text looks.
 */
async function xHeight(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => {
    const style = getComputedStyle(el);
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) throw new Error('No 2D canvas context');
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return ctx.measureText('x').actualBoundingBoxAscent;
  });
}

for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(`typography on ${viewportName}`, () => {
    test.use({ viewport });

    for (const path of STATIC_PAGES) {
      test(`${path} sets all text in a role font at ${MIN_TEXT_PX}px or larger`, async ({ page }) => {
        await expectRoleTypography(page, path);
      });
    }

    test(`newest blog post sets all text in a role font at ${MIN_TEXT_PX}px or larger`, async ({ page }) => {
      await expectRoleTypography(page, await newestPostPath(page));
    });

    test('blog post title, section headings, subheadings, and body text step down in size', async ({ page }) => {
      await page.goto(await postWithSubheadings(page));
      await page.evaluate(() => document.fonts.ready);

      const title = await xHeight(page, 'h1');
      const sectionHeading = await xHeight(page, '.prose h2');
      const subheading = await xHeight(page, '.prose h3');
      const body = await xHeight(page, '.prose p');

      expect.soft(title, 'title vs section heading').toBeGreaterThan(sectionHeading);
      expect.soft(sectionHeading, 'section heading vs subheading').toBeGreaterThan(subheading);
      expect.soft(subheading, 'subheading vs body text').toBeGreaterThan(body);
    });
  });
}
