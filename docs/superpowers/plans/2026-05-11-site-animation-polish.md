# Site Animation & Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a whisper-character motion layer (scroll reveals, page transitions, ambient effects, micro-interaction polish) to the portfolio site with zero new dependencies.

**Architecture:** Astro View Transitions handles page crossfades natively. A single IntersectionObserver script — initialized on each `astro:page-load` event — watches `[data-reveal]` elements and adds `.is-visible` to fade them in. Ambient effects and easing upgrades are pure CSS. All animations are wrapped in `@media (prefers-reduced-motion: no-preference)`.

**Tech Stack:** Astro View Transitions API, native IntersectionObserver, CSS animations/keyframes, `cubic-bezier(0.4,0,0.2,1)` easing.

---

## File Map

| File | What changes |
|------|-------------|
| `src/layouts/BaseLayout.astro` | ViewTransitions import+tag, global reveal CSS, IntersectionObserver script, focus-visible ring |
| `src/components/Nav.astro` | `transition:name` on wordmark, active underline animation, easing upgrades |
| `src/pages/index.astro` | Hero entrance animation, topo breathing, portrait pulse, feed reveal attributes, easing upgrades |
| `src/pages/work.astro` | Reveal attributes on all sections, bento stagger, tab transition fix, easing upgrades |
| `src/pages/about.astro` | Reveal attributes on header, body, PNW card |
| `src/pages/blog/index.astro` | Reveal attributes on header and blog card grid, card hover shadow |
| `src/layouts/BlogPost.astro` | Reveal attribute on post header |

---

## Task 1: BaseLayout — ViewTransitions + global reveal CSS + focus-visible

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add ViewTransitions import and tag**

  In `src/layouts/BaseLayout.astro`, add the import at the top of the frontmatter and the tag inside `<head>`:

  ```astro
  ---
  import type { ImageMetadata } from 'astro';
  import { Font } from 'astro:assets';
  import { ViewTransitions } from 'astro:transitions';
  import FallbackImage from '../assets/blog-placeholder-1.jpg';
  import { SITE_TITLE } from '../consts';
  // ... rest of frontmatter unchanged
  ---
  ```

  Inside `<head>`, add `<ViewTransitions />` just before the closing `</head>` tag (after the existing meta/link tags):

  ```html
  <ViewTransitions />
  ```

- [ ] **Step 2: Add global reveal CSS and focus-visible to the global style block**

  In the `<style is:global>` block, append these rules after the existing `a` and `img` rules:

  ```css
  /* Scroll reveal system */
  @media (prefers-reduced-motion: no-preference) {
    [data-reveal] {
      opacity: 0;
      transition: opacity 0.65s ease;
    }
    [data-reveal].is-visible {
      opacity: 1;
    }
  }

  /* Keyboard focus ring */
  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
    border-radius: 3px;
  }
  ```

- [ ] **Step 3: Verify build succeeds**

  ```bash
  npm run build
  ```

  Expected: build completes with no errors. Astro will warn if `ViewTransitions` is imported incorrectly.

- [ ] **Step 4: Commit**

  ```bash
  git add src/layouts/BaseLayout.astro
  git commit -m "feat: add ViewTransitions, reveal CSS, focus-visible to BaseLayout"
  ```

---

## Task 2: BaseLayout — IntersectionObserver script

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add the observer script**

  At the very end of `src/layouts/BaseLayout.astro` (after the `</style>` block), add:

  ```astro
  <script>
    function initReveal() {
      // Apply manual delays from data-reveal-delay attribute (value in ms)
      document.querySelectorAll<HTMLElement>('[data-reveal][data-reveal-delay]').forEach(el => {
        const delay = el.getAttribute('data-reveal-delay');
        if (delay) el.style.transitionDelay = `${delay}ms`;
      });

      // Apply stagger delays to direct [data-reveal] children of [data-reveal-stagger] containers
      document.querySelectorAll('[data-reveal-stagger]').forEach(container => {
        const children = Array.from(container.children).filter(
          child => child.hasAttribute('data-reveal')
        ) as HTMLElement[];
        children.forEach((child, i) => {
          child.style.transitionDelay = `${Math.min(i, 5) * 80}ms`;
        });
      });

      // Observe all [data-reveal] elements
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    }

    // Fires on initial load and after each View Transition navigation
    document.addEventListener('astro:page-load', initReveal);
  </script>
  ```

- [ ] **Step 2: Verify build succeeds**

  ```bash
  npm run build
  ```

  Expected: no errors. TypeScript in Astro `<script>` blocks is compiled automatically.

- [ ] **Step 3: Start dev server and manually verify the system works**

  ```bash
  npm run dev
  ```

  Open `http://localhost:4321`. Open DevTools → Elements. Find any element and manually add `data-reveal` as an attribute. Scroll it out of view, then back in — it should fade in when `is-visible` gets added. Remove the test attribute when done.

- [ ] **Step 4: Commit**

  ```bash
  git add src/layouts/BaseLayout.astro
  git commit -m "feat: add IntersectionObserver scroll reveal script to BaseLayout"
  ```

---

## Task 3: Nav — transition:name + active underline animation + easing upgrades

**Files:**
- Modify: `src/components/Nav.astro`

- [ ] **Step 1: Add `transition:name` to the wordmark anchor**

  In `src/components/Nav.astro`, find the wordmark anchor (line ~51) and add the directive:

  ```astro
  <a href="/" class="dark-wordmark" transition:name="wordmark" aria-label="Nathan Pickard — home">NP</a>
  ```

- [ ] **Step 2: Update nav link CSS — position:relative + remove text-decoration underline + add ::after underline animation**

  In the `<style>` block, replace the `.dark-nav a` and `.dark-nav a.active` rules with:

  ```css
  .dark-nav a {
    font-family: var(--font-vollkorn);
    color: #c8e0d0;
    text-decoration: none;
    font-size: 21px;
    font-weight: 400;
    transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  .dark-nav a:hover {
    color: #d4af37;
  }
  .dark-nav a.active {
    color: #d4af37;
  }
  .dark-nav a.active::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 1px;
    background: #d4af37;
    transform-origin: left;
    animation: underlineGrow 0.3s ease-out both;
  }
  @keyframes underlineGrow {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  ```

- [ ] **Step 3: Upgrade easing on wordmark, social links, and hamburger**

  Replace the existing transition values:

  `.dark-wordmark` — change `transition: color 0.2s;` to:
  ```css
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  ```

  `.social-link` — change `transition: background 0.2s;` to:
  ```css
  transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  ```

  `.social-link :global(svg)` — change the existing multi-property transition to:
  ```css
  transition:
    filter 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  ```

  `.hamburger` — change `transition: background 0.2s;` to:
  ```css
  transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  ```

  `.mobile-nav a` — change the existing transition to:
  ```css
  transition:
    border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    background 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  ```

- [ ] **Step 4: Verify build and visual**

  ```bash
  npm run build
  ```

  Then:
  ```bash
  npm run dev
  ```

  Navigate between pages — the NP wordmark should stay fixed while page content fades. The active nav link should show the gold underline animating in from the left on each page load.

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/Nav.astro
  git commit -m "feat: add transition:name to wordmark, animated active underline, easing upgrades in Nav"
  ```

---

## Task 4: Homepage — hero entrance animation + ambient effects + easing upgrades

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add hero entrance animation CSS**

  In the `<style>` block of `src/pages/index.astro`, add inside the `/* ── Hero ── */` section, after the `.topo` rule:

  ```css
  @media (prefers-reduced-motion: no-preference) {
    .hero-inner {
      animation: heroFadeIn 0.7s ease both;
    }
    @keyframes heroFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  }
  ```

- [ ] **Step 2: Add topo breathing animation CSS**

  Still in the `<style>` block, add after the `.topo` rule:

  ```css
  @media (prefers-reduced-motion: no-preference) {
    .topo path {
      stroke-dasharray: 1400;
      stroke-dashoffset: 1400;
      animation: topoBreath 18s ease-in-out infinite alternate;
    }
    .topo path:nth-child(2) { animation-delay: 3s; }
    .topo path:nth-child(3) { animation-delay: 6s; }
    .topo path:nth-child(4) { animation-delay: 9s; }
    .topo path:nth-child(5) { animation-delay: 12s; }
    .topo path:nth-child(6) { animation-delay: 15s; }
    @keyframes topoBreath {
      to { stroke-dashoffset: 0; }
    }
  }
  ```

- [ ] **Step 3: Add portrait accent border pulse CSS**

  Add after the existing `.portrait-frame::before` rule:

  ```css
  @media (prefers-reduced-motion: no-preference) {
    .portrait-frame::before {
      animation: borderPulse 5s ease-in-out infinite;
    }
    @keyframes borderPulse {
      0%, 100% { opacity: 0.35; }
      50% { opacity: 0.55; }
    }
  }
  ```

- [ ] **Step 4: Upgrade button easing**

  In `.btn-primary`, change `transition: opacity 0.2s, transform 0.2s;` to:
  ```css
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  ```

  In `.btn-ghost`, change `transition: border-color 0.2s, color 0.2s;` to:
  ```css
  transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  ```

- [ ] **Step 5: Verify build and visual**

  ```bash
  npm run build && npm run dev
  ```

  At `http://localhost:4321`: the hero section should fade in on load. The topo lines in the background should slowly draw themselves (may take a few seconds to become visible — check after 5–10s). The portrait's gold accent border should pulse very gently.

- [ ] **Step 6: Commit**

  ```bash
  git add src/pages/index.astro
  git commit -m "feat: hero entrance animation, topo breathing, portrait pulse on homepage"
  ```

---

## Task 5: Homepage — feed section reveal attributes

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add `data-reveal` to the feeds header and wrap feeds in stagger divs**

  In `src/pages/index.astro`, find the feeds section (around line 91) and update it:

  ```astro
  <section class="feeds-section">
    <div class="feeds-inner">
      <div class="feeds-header" data-reveal>
        <h2 class="feeds-h2">What I've been up to</h2>
      </div>
      <div class="feeds-grid" data-reveal-stagger>
        <div data-reveal><BlueskyFeed /></div>
        <div data-reveal><GitHubFeed /></div>
      </div>
    </div>
  </section>
  ```

  The wrapper `<div data-reveal>` elements become the grid items; BlueskyFeed/GitHubFeed render inside them. The existing `:global(.bluesky-feed)` and `:global(.github-feed)` CSS still works because it targets by class name, not direct grid-child position.

- [ ] **Step 2: Verify build and visual**

  ```bash
  npm run build && npm run dev
  ```

  At `http://localhost:4321`: scroll down past the hero — the "What I've been up to" heading should fade in, then the two feed columns should fade in with a slight stagger (80ms apart).

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/index.astro
  git commit -m "feat: scroll reveal attributes on homepage feeds section"
  ```

---

## Task 6: Work page — reveal attributes on all sections

**Files:**
- Modify: `src/pages/work.astro`

- [ ] **Step 1: Add `data-reveal` to the page header, work grid, and accordion**

  In `src/pages/work.astro`, update the HTML structure inside `<main class="work-main">`:

  ```astro
  <div class="work-header" data-reveal>
    <h1 class="work-h1">From idea to impact</h1>
    <p class="work-sub">Work that ships and results that stick</p>
  </div>
  ```

  Add `data-reveal` to the desktop grid:
  ```astro
  <div class="work-grid" id="work-grid" data-reveal>
  ```

  Add `data-reveal` to the mobile accordion:
  ```astro
  <div class="work-accordion" aria-label="Work history" data-reveal>
  ```

- [ ] **Step 2: Add `data-reveal` to the skills heading and `data-reveal-stagger` to the bento grid**

  Find the skills section and update — `data-reveal` goes on the `<h2>` only, not the `<section>` wrapper (putting it on the wrapper AND on child panels creates a double-fade, since panels at `opacity:0` inside a section also at `opacity:0` would fade twice):

  ```astro
  <section class="skills-section" aria-labelledby="skills-heading">
    <h2 class="skills-h2" id="skills-heading" data-reveal>The tools I reach for</h2>
    <div class="bento-grid" data-reveal-stagger>
      {
        panelConfig.map((panel) => (
          <div
            class="bento-panel"
            data-panel-id={panel.id}
            style={`--accent: ${panel.accent}`}
            data-reveal
          >
  ```

  The heading fades in first. Then as the user scrolls into the bento grid, each panel fades in with 80ms stagger.

- [ ] **Step 3: Add `data-reveal` to community section and CTA row**

  ```astro
  <section class="community-section" aria-labelledby="community-heading" data-reveal>
  ```

  ```astro
  <div class="work-cta-row" data-reveal>
  ```

- [ ] **Step 4: Verify build**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 5: Visual verification**

  ```bash
  npm run dev
  ```

  Navigate to `http://localhost:4321/work`. Scroll slowly — the page header should fade in first, then the work history grid, then each skill panel in sequence, then the community section, then the CTA.

- [ ] **Step 6: Commit**

  ```bash
  git add src/pages/work.astro
  git commit -m "feat: scroll reveal attributes on work page sections and bento grid"
  ```

---

## Task 7: Work page — tab transition fix + easing upgrades

**Files:**
- Modify: `src/pages/work.astro`

- [ ] **Step 1: Fix work tab transition (eliminate layout shift + smooth border)**

  In the `<style>` block of `src/pages/work.astro`, replace the `.work-tab` and `.work-tab.active` rules:

  ```css
  .work-tab {
    width: 100%;
    background: transparent;
    border: 0;
    border-bottom: 1px solid rgba(137, 174, 151, 0.2);
    border-left: 3px solid transparent;
    padding: 20px 24px;
    text-align: left;
    cursor: pointer;
    transition:
      background 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      border-left-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    color: #ede8d8;
  }
  .work-tab:last-child {
    border-bottom: 0;
  }
  .work-tab:hover {
    background: rgba(255, 255, 255, 0.04);
  }
  .work-tab.active {
    background: #162b1b;
    border-left-color: #d4af37;
  }
  ```

  The key change: `border-left: 3px solid transparent` is always present (prevents 3px layout shift on activation), and only `border-left-color` transitions.

- [ ] **Step 2: Apply same fix to mobile accordion trigger**

  Replace `.accordion-trigger` and `.accordion-trigger.active`:

  ```css
  .accordion-trigger {
    width: 100%;
    background: transparent;
    border: 0;
    border-left: 3px solid transparent;
    padding: 20px 24px;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: #ede8d8;
    transition:
      background 0.15s cubic-bezier(0.4, 0, 0.2, 1),
      border-left-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .accordion-trigger:hover {
    background: rgba(255, 255, 255, 0.04);
  }
  .accordion-trigger.active {
    background: #162b1b;
    border-left-color: #d4af37;
  }
  ```

- [ ] **Step 3: Upgrade easing on skill tiles, pills, and CTA button**

  In `.skill-icon-tile`, replace `transition: border-color 0.2s, background 0.2s;` with:
  ```css
  transition:
    border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  ```

  In `.spec-pill`, replace `transition: border-color 0.2s;` with:
  ```css
  transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  ```

  In `.btn-primary` (work page version), replace `transition: opacity 0.2s;` with:
  ```css
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  ```

- [ ] **Step 4: Verify build and visual**

  ```bash
  npm run build && npm run dev
  ```

  At `http://localhost:4321/work`: click between work history tabs — the gold left border should animate smoothly in/out rather than snapping. No content shift should occur when switching tabs.

- [ ] **Step 5: Commit**

  ```bash
  git add src/pages/work.astro
  git commit -m "feat: smooth tab transitions, easing upgrades on work page"
  ```

---

## Task 8: About page — reveal attributes

**Files:**
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Add `data-reveal` attributes to the three reveal targets**

  In `src/pages/about.astro`, update the main content structure:

  ```astro
  <div class="about-header" data-reveal>
    <h1 class="about-h1">
      Craft, curiosity, and coffee<br />- A bit about me
    </h1>
  </div>

  <div class="about-body-row">
    <div class="about-body" data-reveal>
      <!-- bio paragraphs and CTAs unchanged -->
    </div>

    <div class="pnw-card" data-reveal data-reveal-delay="120">
      <!-- card content unchanged -->
    </div>
  </div>
  ```

  The `data-reveal-delay="120"` on `.pnw-card` causes the observer script to apply `transition-delay: 120ms` before adding `.is-visible`, so the card settles 120ms after the bio text.

- [ ] **Step 2: Verify build and visual**

  ```bash
  npm run build && npm run dev
  ```

  At `http://localhost:4321/about`: the heading should fade in first, then the bio text, then the PNW card appears 120ms later.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/about.astro
  git commit -m "feat: scroll reveal attributes on about page"
  ```

---

## Task 9: Blog index — reveal attributes + card hover upgrade

**Files:**
- Modify: `src/pages/blog/index.astro`

- [ ] **Step 1: Add `data-reveal` to the header and stagger on the blog grid**

  In `src/pages/blog/index.astro`, update the blog header and grid:

  ```astro
  <div class="blog-header" data-reveal>
    <h1 class="blog-h1">What I'm thinking, building, and reading</h1>
  </div>

  <div class="blog-grid" data-reveal-stagger>
    {
      posts.map((post) => (
        <a href={`/blog/${post.id}/`} class="blog-card" data-reveal>
          {/* card content unchanged */}
        </a>
      ))
    }
  </div>
  ```

  The `.blog-card` anchor elements are direct children of `.blog-grid`, so the stagger observer finds them correctly.

- [ ] **Step 2: Upgrade blog card hover shadow and easing**

  In the `<style>` block, replace the `.blog-card` rule:

  ```css
  .blog-card {
    display: flex;
    flex-direction: column;
    background: #162b1b;
    border: 1px solid rgba(137, 174, 151, 0.2);
    border-radius: 10px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 4px 20px rgba(212, 175, 55, 0.05);
    transition:
      border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .blog-card:hover {
    border-color: #d4af37;
    box-shadow: 0 8px 32px rgba(212, 175, 55, 0.13);
    transform: translateY(-2px);
  }
  ```

- [ ] **Step 3: Verify build and visual**

  ```bash
  npm run build && npm run dev
  ```

  At `http://localhost:4321/blog`: cards should fade in left-to-right with stagger on scroll. Hover a card — it should lift with a subtle gold glow in the shadow.

- [ ] **Step 4: Commit**

  ```bash
  git add src/pages/blog/index.astro
  git commit -m "feat: reveal attributes and card hover shadow on blog index"
  ```

---

## Task 10: BlogPost layout — post header reveal

**Files:**
- Modify: `src/layouts/BlogPost.astro`

- [ ] **Step 1: Add `data-reveal` to the post header**

  In `src/layouts/BlogPost.astro`, find `.post-header` (around line 33) and add the attribute:

  ```astro
  <div class="post-header" data-reveal>
    <div class="post-date">
      <FormattedDate date={pubDate} />
      {
        updatedDate && (
          <span class="updated">
            {' '}
            · Updated <FormattedDate date={updatedDate} />
          </span>
        )
      }
    </div>
    <h1 class="post-title">{title}</h1>
    {description && <p class="post-desc">{description}</p>}
    <div class="post-divider"></div>
  </div>
  ```

- [ ] **Step 2: Verify build and visual**

  ```bash
  npm run build && npm run dev
  ```

  Navigate to a blog post at `http://localhost:4321/blog/[slug]`. The post title, date, and description should fade in as a unit on page load.

- [ ] **Step 3: Commit**

  ```bash
  git add src/layouts/BlogPost.astro
  git commit -m "feat: reveal attribute on blog post header"
  ```

---

## Task 11: Final verification pass

- [ ] **Step 1: Run the full build**

  ```bash
  npm run build
  ```

  Expected: zero errors, zero warnings about missing transitions or imports.

- [ ] **Step 2: Run existing tests**

  ```bash
  npx vitest run
  ```

  Expected: all tests pass. The reveal attribute additions are HTML attributes only — they don't affect the structural selectors the existing tests check.

- [ ] **Step 3: Full site walkthrough with dev server**

  ```bash
  npm run dev
  ```

  Check each of the following:

  - **Page transitions:** Navigate between every page pair. Each should crossfade smoothly. The NP wordmark should never blink or disappear.
  - **Homepage:** Hero fades in on load. Topo lines slowly draw. Portrait border pulses. Scroll to feeds — heading then two columns appear with stagger.
  - **Work page:** Scroll — header, work grid, skills heading, bento panels (staggered), community text, CTA each fade in. Click between work tabs — gold border animates in without layout shift.
  - **About page:** Header → bio → PNW card (slight delay) reveal sequence.
  - **Blog index:** Header then cards stagger in. Hover a card — lift + shadow.
  - **Blog post:** Post header fades in on arrival.
  - **Reduced motion:** In macOS System Settings → Accessibility → Display → enable "Reduce motion". Reload — all animations should be absent; content should be visible immediately with no `opacity: 0` hiding anything.
  - **Keyboard navigation:** Tab through links on any page — gold outline ring should appear on focused elements.

- [ ] **Step 4: Final commit if any minor corrections were made during the walkthrough**

  ```bash
  git add -p
  git commit -m "fix: animation polish corrections from final walkthrough"
  ```
