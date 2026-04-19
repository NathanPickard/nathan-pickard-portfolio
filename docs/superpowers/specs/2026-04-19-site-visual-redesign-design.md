# Site Visual Redesign — Design Spec

**Date:** 2026-04-19
**Approach:** Refined Editorial (Option A)
**Scope:** Full site — global styles, homepage, about, blog listing, header, footer

---

## Goals

Make the site feel warm, editorial, and credible to both recruiters and the dev community — without a full structural rebuild. The Bear Blog foundation stays; this redesign adds visual personality on top of it.

---

## 1. Color & Typography (Global)

### Colors

| Token | Current | Proposed |
|---|---|---|
| `--accent` | `#194db2` (cold blue) | `#2a7d4f` (forest green) |
| `--accent-dark` | `#0f2e6b` | `#1a5c37` |
| Page background | `#ffffff` | `#fafaf8` (warm off-white) |
| Body gradient | `rgba(229,233,240,50%) → #fff` | `rgba(216,234,220,40%) → #fafaf8` (warm green tint) |
| Card/surface background | `#ffffff` | `#ffffff` (unchanged) |
| Card/feed border | `rgb(var(--gray-light))` | `#e8e6e0` (warm gray) |
| Section divider line | `rgb(var(--gray-light))` | `#dde8d8` (warm green-gray) |

The green accent replaces every usage of the blue: nav active underlines, links, blockquotes, hover states, feed card headings, blog card dates, and highlight card left borders.

### Typography

- **Add:** [Lora](https://fonts.google.com/specimen/Lora) (Google Font, 400/600/700 weights, italic variant) — loaded via `<link>` in `BaseHead.astro`
- **Apply Lora to:** site title in Header, `h1`/`h2`/`h3` on all pages, feed card section titles, blog card titles, footer name
- **Keep Atkinson for:** body text, nav links, UI labels, dates, captions
- **Section spacing:** standardize vertical section padding to `4rem` top/bottom across all pages

---

## 2. Header

Minimal changes — the existing structure is solid.

- Site title (`Nathan Pickard`) switches to Lora serif
- Active nav underline color: blue → green (`#2a7d4f`)
- Hover underline color: blue → green
- Background: `#ffffff` → `#fafaf8`
- Social icons remain in the header (no change to placement or behavior)

---

## 3. Homepage (`src/pages/index.astro`)

### Hero section (replaces current greeting + intro)

Replace the loose `<h3>` greeting and `flex` intro with a structured editorial hero:

```
[ Eyebrow label: "Software Engineer · Portland, OR" ]  [ Photo ]
[ Serif h1: "Nathan Pickard"                        ]
[ Italic tagline: "Building thoughtful web..."      ]
[ CTA buttons: "View Resume"  "Read Blog"           ]
```

- Eyebrow: small-caps uppercase, green, sits above the name
- Name: Lora, `h1`-sized, bold
- Tagline: Lora italic, subdued gray — exact text is user-defined (e.g. "Building thoughtful web experiences at the intersection of craft and scale.")
- Photo: retains border-radius, gains a white border and a subtle green offset accent border behind it
- CTA buttons: primary (green fill, white text) + secondary (green outline)
- Hero bottom border: `1px solid #dde8d8` separating it from feeds

### Feeds section

- Section header: "Recent Activity" label (Lora, small) + full-width ruled line
- Feed cards gain an icon in the card header (Bluesky butterfly, GitHub mark)
- Card borders: warm (`#e8e6e0`) with a faint green box-shadow
- Feed card headings: green, Lora serif

---

## 4. About Page (`src/pages/about.astro`)

### Hero (replaces centered photo)

Two-column layout at the top of the prose area:

```
[ Photo ]  [ Eyebrow: "Software Engineer · Portland, OR" ]
           [ Serif name: "Nathan Pickard"                ]
           [ Italic sub: "6+ years building..."          ]
```

- Photo: same size, gains green-tinted shadow and white border (consistent with homepage)
- Bottom border separates hero from content sections

### Career Highlights

Replace the `<ul>` bullet list with left-bordered highlight cards:

- Each card: white background, `3px solid #2a7d4f` left border, rounded right corners
- Card title: bold, dark (`#0f1219`)
- Card body: smaller, gray
- Subtle green box-shadow

### Section dividers

All `<h3>` section titles (Career Highlights, My Technical Toolkit, Community) get the editorial divider treatment: title text + full-width ruled line to the right, using flexbox.

---

## 5. Blog Listing (`src/pages/blog/index.astro`)

- Page-level section header: "Writing" (Lora) + ruled line
- Blog cards: white rounded containers (`border-radius: 8px`) with warm border and faint green shadow
- Card layout: hero image on top, then date (green, small-caps), serif title, short description
- Description: pulled from post `description` frontmatter (already typed in the content schema)
- First post loses its special "full-width + centered" treatment — all posts use the same card layout for consistency

---

## 6. Footer (`src/components/Footer.astro`)

Replace the single copyright line with a two-column dark footer:

- Background: `#1c2a22` (dark forest)
- Left column: name (Lora, light green), italic tagline, copyright + location
- Right column: nav links (Home, Blog, About, Resume) stacked vertically
- Social icons: **stay in the header** (not duplicated in footer)

---

## 7. What Is Not Changing

- Site structure, routing, and Astro page composition
- Atkinson font (body text)
- Mobile hamburger menu behavior
- Blog post layout/structure (`src/layouts/BlogPost.astro`) — out of scope for this pass. Note: Lora and the green accent will apply to blog posts automatically since `BaseHead` is shared; only structural changes to the post layout are deferred.
- Resume page — out of scope for this pass
- Dark mode — explicitly not in scope

---

## Open Questions / Decisions Made

| Question | Decision |
|---|---|
| Dark mode? | No — light-only |
| New accent color? | Forest green `#2a7d4f` |
| Serif font? | Lora (Google Font) for headings only |
| Social icons in footer? | No — keep them in header |
| First blog post special treatment? | Remove — uniform card grid |
