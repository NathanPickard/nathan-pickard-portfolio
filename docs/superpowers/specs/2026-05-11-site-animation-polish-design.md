# Site Animation & Polish Design

**Date:** 2026-05-11
**Branch:** redesign-organic-editorial

## Summary

Add a full motion and polish layer to the portfolio site. Three animation layers (scroll reveals, page transitions, ambient/atmospheric) plus a targeted set of micro-interaction upgrades. Character: whisper — pure opacity fades, barely-there movement, typography and color do the work.

## Decisions Made

- **Animation style:** All four layers (scroll reveals + page transitions + ambient + polish)
- **Character:** Whisper — pure opacity fades, no spatial drama, subtle easing upgrades
- **Approach:** Native-first — CSS animations + IntersectionObserver + Astro View Transitions. Zero new dependencies.
- **Accessibility:** All animations wrapped in `@media (prefers-reduced-motion: no-preference)`

---

## Layer 1: Page Transitions

**What:** Crossfade between all pages using Astro's built-in View Transitions API.

**Changes to `src/layouts/BaseLayout.astro`:**
- Import and add `<ViewTransitions />` to `<head>`
- Default fade animation (Astro's built-in) at ~250ms — no custom override needed

**Changes to `src/components/Nav.astro`:**
- Add `transition:name="wordmark"` to the `NP` anchor element so it persists across navigations rather than fading out and back in

**Behavior:** Every `<a href>` navigation triggers a crossfade. The NP wordmark persists across navigations without fading — it stays in place while the page content transitions around it.

---

## Layer 2: Scroll-triggered Reveals

**System design:**

Two attributes drive the system:
- `data-reveal` — single element fades in when it crosses the IntersectionObserver threshold
- `data-reveal-stagger` — container whose direct children each receive a staggered `transition-delay` (80ms increments, max 5 items counted for delay so the 6th+ item doesn't wait forever)

**CSS added globally in `BaseLayout.astro`:**
```css
@media (prefers-reduced-motion: no-preference) {
  [data-reveal] {
    opacity: 0;
    transition: opacity 0.65s ease;
  }
  [data-reveal].is-visible {
    opacity: 1;
  }
  [data-reveal-stagger] > [data-reveal] {
    /* delays set inline by the observer script */
  }
}
```

**Script added to `BaseLayout.astro`:**
- Creates an `IntersectionObserver` with `threshold: 0.15`
- On intersection: adds `is-visible` to the element
- Fires on `astro:page-load` event so it re-initializes after each View Transition
- Stagger logic: for children of `[data-reveal-stagger]`, sets `transition-delay: ${index * 80}ms` inline (index capped at 5 for delay calculation)
- Manual delay: elements with `data-reveal-delay="120"` get `transition-delay: 120ms` set before `.is-visible` is added (the value is in milliseconds)

**Per-page attribute placement:**

| Page | Element | Attribute |
|------|---------|-----------|
| Homepage | `.hero-inner` | CSS entrance animation (above-fold, no observer) |
| Homepage | `.feeds-header` | `data-reveal` |
| Homepage | `.feeds-grid` | `data-reveal-stagger` (children: BlueskyFeed, GitHubFeed) |
| Work | `.work-header` | `data-reveal` |
| Work | `.work-grid` / `.work-accordion` | `data-reveal` |
| Work | `.skills-section` heading | `data-reveal` |
| Work | `.bento-grid` | `data-reveal-stagger` (children: bento panels) |
| Work | `.community-section` | `data-reveal` |
| Work | `.work-cta-row` | `data-reveal` |
| About | `.about-header` | `data-reveal` |
| About | `.about-body` | `data-reveal` |
| About | `.pnw-card` | `data-reveal` with 120ms delay |
| Blog index | `.blog-header` | `data-reveal` |
| Blog index | `.blog-grid` | `data-reveal-stagger` (children: blog cards) |
| Blog post | article header group | `data-reveal` |

**Hero entrance animation (homepage):**
Above-the-fold content uses a CSS `@keyframes` animation directly (not the observer) so it fires immediately on load without waiting for scroll:
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

---

## Layer 3: Ambient / Atmospheric Effects

All CSS-only, all in `prefers-reduced-motion` guard.

### Hero topo lines — breathing animation

The SVG `<path>` elements in the homepage hero get a slow `stroke-dashoffset` loop:
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
Opacity stays at the existing 0.08 — no visual brightening, just motion.

### Portrait accent border — slow pulse

The `portrait-frame::before` pseudo-element gets an opacity pulse:
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

### Easing upgrade — all hover transitions

Every `transition: ... ease` or `transition: ... 0.2s` across Nav, buttons, cards, and work tabs gets upgraded to `cubic-bezier(0.4, 0, 0.2, 1)`. Applied to:
- `.dark-wordmark`, `.dark-nav a`, `.social-link`
- `.btn-primary`, `.btn-ghost` (both homepage and work page variants)
- `.work-tab`, `.accordion-trigger`
- `.blog-card`
- `.skill-icon-tile`
- `.spec-pill`

---

## Layer 4: Polish Upgrades

### Focus-visible ring

Added globally in `BaseLayout.astro` styles:
```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 3px;
}
```
Scoped to `:focus-visible` — invisible for mouse users, clear for keyboard users.

### Nav active underline — animated on arrival

Replace static `text-decoration: underline` on `.dark-nav a.active` with a `::after` pseudo-element that animates `width: 0 → 100%`:
```css
.dark-nav a.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
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
Nav links need `position: relative` for this to work.

### Blog card hover — lift with shadow

Current hover has `translateY(-2px)` and border-color change. Add shadow growth:
```css
.blog-card {
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.05);
  transition: border-color 0.2s cubic-bezier(0.4,0,0.2,1),
              box-shadow 0.2s cubic-bezier(0.4,0,0.2,1),
              transform 0.2s cubic-bezier(0.4,0,0.2,1);
}
.blog-card:hover {
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.13);
}
```

### Work tab transitions — smooth switching

Add transition to the tab background and left-border:
```css
.work-tab {
  transition: background 0.2s cubic-bezier(0.4,0,0.2,1),
              border-left-color 0.2s cubic-bezier(0.4,0,0.2,1);
  border-left: 3px solid transparent;
}
```
The `border-left: 3px solid transparent` at rest prevents the layout shift when the active gold border appears.

### Skill icon tile stagger

The bento panels in `.bento-grid` use `data-reveal-stagger` so each panel fades in sequentially as the section scrolls into view. The tiles within each panel all appear together when their panel becomes visible — no nested stagger inside panels.

---

## Files Changed

| File | Change |
|------|--------|
| `src/layouts/BaseLayout.astro` | ViewTransitions, global reveal CSS, observer script, focus-visible |
| `src/components/Nav.astro` | `transition:name`, active underline animation, easing upgrades |
| `src/pages/index.astro` | Hero entrance animation, topo breathing, portrait pulse, reveal attributes, easing upgrades |
| `src/pages/work.astro` | Reveal attributes on all sections, tab transition fix, skill tile stagger, easing upgrades |
| `src/pages/about.astro` | Reveal attributes on header, body, PNW card |
| `src/pages/blog/index.astro` | Reveal attributes on header and blog card grid |
| `src/layouts/BlogPost.astro` | Reveal attribute on article header |

## Out of Scope

- Parallax scroll effects (would conflict with whisper character)
- Loading spinners or skeleton states
- Hover video/image previews
- Any animation on `resume.astro` (content-dense, animation would distract)
