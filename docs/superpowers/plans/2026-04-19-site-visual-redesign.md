# Site Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a warm editorial visual redesign across the full site — new accent color, Lora serif headings, editorial homepage hero, improved About/Blog/Footer layouts.

**Architecture:** CSS variable changes in `global.css` propagate the new green accent and warm background site-wide. Lora font is added once in `BaseHead.astro` and applied to `h1`/`h2`/`h3` globally. A new `SectionHeader` component provides the reusable title + ruled-line pattern used on three pages. All other changes are scoped to their individual page or component files.

**Tech Stack:** Astro, TypeScript, Tailwind CSS v4 (via Vite plugin), `astro-icon`, Google Fonts (Lora). No test runner — verification is `npm run build` (must exit 0) plus visual inspection at `npm run dev`.

**Spec:** `docs/superpowers/specs/2026-04-19-site-visual-redesign-design.md`

---

## File Map

| Action | File |
|---|---|
| Modify | `src/styles/global.css` |
| Modify | `src/components/BaseHead.astro` |
| Create | `src/components/SectionHeader.astro` |
| Modify | `src/components/Header.astro` |
| Modify | `src/components/Footer.astro` |
| Modify | `src/components/BlueskyFeed.astro` |
| Modify | `src/components/GitHubFeed.astro` |
| Modify | `src/pages/index.astro` |
| Modify | `src/pages/about.astro` |
| Modify | `src/pages/blog/index.astro` |
| Modify | `.gitignore` |

---

## Task 1: Add .superpowers/ to .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add the entry**

Open `.gitignore` and add this line at the end:

```
# Visual brainstorming session files
.superpowers/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers/ brainstorm files"
```

---

## Task 2: Add Lora font and update global CSS variables

**Files:**
- Modify: `src/components/BaseHead.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add Lora to BaseHead.astro**

In `src/components/BaseHead.astro`, add three lines after the existing `<link rel="sitemap" ...>` line:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: Update CSS variables and body in global.css**

In `src/styles/global.css`, replace the `:root` block and body declaration:

```css
:root {
  --accent: #2a7d4f;
  --accent-dark: #1a5c37;
  --black: 15, 18, 25;
  --gray: 96, 115, 159;
  --gray-light: 229, 233, 240;
  --gray-dark: 34, 41, 57;
  --gray-gradient: rgba(216, 234, 220, 0.4), #fafaf8;
  --box-shadow:
    0 2px 6px rgba(var(--gray), 25%), 0 8px 24px rgba(var(--gray), 33%),
    0 16px 32px rgba(var(--gray), 33%);
}
```

In the `body` rule, add `background-color: #fafaf8;` so the warm off-white shows below the 600px gradient:

```css
body {
  font-family: 'Atkinson', sans-serif;
  margin: 0;
  padding: 0;
  text-align: left;
  background-color: #fafaf8;
  background: linear-gradient(var(--gray-gradient)) no-repeat;
  background-size: 100% 600px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  color: rgb(var(--gray-dark));
  font-size: 20px;
  line-height: 1.7;
}
```

- [ ] **Step 3: Apply Lora to h1, h2, h3**

In `src/styles/global.css`, add `font-family` to the heading rules. Find the `h1, h2, h3, h4, h5, h6` block and split it so only h1–h3 get Lora:

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0 0 0.5rem 0;
  color: rgb(var(--black));
  line-height: 1.2;
}
h1,
h2,
h3 {
  font-family: 'Lora', Georgia, serif;
}
h1 {
  font-size: 3.052em;
}
h2 {
  font-size: 2.441em;
}
h3 {
  font-size: 1.953em;
}
h4 {
  font-size: 1.563em;
}
h5 {
  font-size: 1.25em;
}
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: exits 0, no TypeScript or Astro errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/BaseHead.astro src/styles/global.css
git commit -m "feat: add Lora font, update accent to forest green, warm background"
```

---

## Task 3: Create SectionHeader component

**Files:**
- Create: `src/components/SectionHeader.astro`

- [ ] **Step 1: Create the file**

Create `src/components/SectionHeader.astro` with this content:

```astro
---
interface Props {
  title: string;
}
const { title } = Astro.props;
---

<div class="section-header">
  <span class="section-title">{title}</span>
  <div class="section-line"></div>
</div>

<style>
  .section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .section-title {
    font-family: 'Lora', Georgia, serif;
    font-size: 1rem;
    font-weight: 600;
    color: rgb(var(--black));
    white-space: nowrap;
  }
  .section-line {
    flex: 1;
    height: 1px;
    background: #dde8d8;
  }
</style>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/SectionHeader.astro
git commit -m "feat: add SectionHeader component for editorial section dividers"
```

---

## Task 4: Update Header component

**Files:**
- Modify: `src/components/Header.astro`

The active/hover underline colors auto-update via `var(--accent)`. Only the background needs an explicit change.

- [ ] **Step 1: Update header background**

In `src/components/Header.astro`, in the `<style>` block, change the `header` rule:

```css
header {
  margin: 0;
  padding: 0 1em;
  background: #fafaf8;
  box-shadow: 0 2px 8px rgba(var(--black), 5%);
  position: relative;
}
```

- [ ] **Step 2: Update mobile nav-menu background**

In the same `<style>` block, in the `@media (max-width: 720px)` section, update `.nav-menu`:

```css
.nav-menu {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fafaf8;
  box-shadow: 0 4px 12px rgba(var(--black), 10%);
  visibility: hidden;
  opacity: 0;
  transform: translateY(-6px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    visibility 0.2s;
  z-index: 100;
}
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: update header to warm off-white background"
```

---

## Task 5: Redesign Footer component

**Files:**
- Modify: `src/components/Footer.astro`

Replace the single copyright line with a dark two-column footer. Social icons stay in the header — the footer has nav links only.

- [ ] **Step 1: Rewrite Footer.astro**

Replace the entire content of `src/components/Footer.astro` with:

```astro
---
const today = new Date();
---

<footer>
  <div class="footer-inner">
    <div class="footer-left">
      <span class="footer-name">Nathan Pickard</span>
      <span class="footer-tagline">Building thoughtful web experiences.</span>
      <span class="footer-copy">&copy; {today.getFullYear()} &middot; Portland, OR</span>
    </div>
    <nav class="footer-nav" aria-label="Footer navigation">
      <a href="/">Home</a>
      <a href="/blog">Blog</a>
      <a href="/about">About</a>
      <a href="/resume">Resume</a>
    </nav>
  </div>
</footer>

<style>
  footer {
    background: #1c2a22;
    padding: 3rem 1.5rem;
    margin-top: 4rem;
  }
  .footer-inner {
    max-width: 875px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
  }
  .footer-left {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .footer-name {
    font-family: 'Lora', Georgia, serif;
    font-size: 1rem;
    font-weight: 700;
    color: #e8f5ec;
  }
  .footer-tagline {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 0.875rem;
    color: #86a892;
  }
  .footer-copy {
    font-size: 0.75rem;
    color: #4a6655;
    margin-top: 0.25rem;
  }
  .footer-nav {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.4rem;
  }
  .footer-nav a {
    font-size: 0.875rem;
    color: #86a892;
    text-decoration: none;
    transition: color 0.2s;
  }
  .footer-nav a:hover {
    color: #e8f5ec;
  }
  @media (max-width: 720px) {
    .footer-inner {
      flex-direction: column;
      gap: 1.5rem;
    }
    .footer-nav {
      align-items: flex-start;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.5rem 1.25rem;
    }
  }
</style>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: redesign footer with dark two-column editorial layout"
```

---

## Task 6: Update feed card borders (BlueskyFeed + GitHubFeed)

**Files:**
- Modify: `src/components/BlueskyFeed.astro`
- Modify: `src/components/GitHubFeed.astro`

The `.feed-heading` icons/colors auto-update via `var(--accent)`. Only card borders need manual warm-tone updates.

- [ ] **Step 1: Update BlueskyFeed post card border and shadow**

In `src/components/BlueskyFeed.astro`, in the `:global(.post)` rule, update `border` and add a `box-shadow`:

```css
:global(.post) {
  width: 100%;
  max-width: 450px;
  border: 1px solid #e8e6e0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(42, 125, 79, 0.06);
  transition:
    box-shadow 0.15s ease,
    transform 0.1s ease;
}
```

- [ ] **Step 2: Update GitHubFeed repo card border and shadow**

In `src/components/GitHubFeed.astro`, in the `.repo-card` rule:

```css
.repo-card {
  border: 1px solid #e8e6e0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(42, 125, 79, 0.06);
  transition:
    box-shadow 0.15s ease,
    transform 0.1s ease;
}
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/BlueskyFeed.astro src/components/GitHubFeed.astro
git commit -m "feat: update feed card borders to warm editorial style"
```

---

## Task 7: Redesign Homepage hero and feeds section

**Files:**
- Modify: `src/pages/index.astro`

Replace the `<h3>` greeting + flex intro with an editorial hero grid. Add a `SectionHeader` before the feeds. Note: `a[href='/blog']` and `a[href='/resume']` in `global.css` add `display: inline-flex` — the CTA buttons override this with explicit display rules.

- [ ] **Step 1: Rewrite index.astro**

Replace the entire content of `src/pages/index.astro` with:

```astro
---
import { Image } from 'astro:assets';
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import SectionHeader from '../components/SectionHeader.astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import ProfileImage from '../assets/nathan-pickard-profile.jpg';
import BlueskyFeed from '@/components/BlueskyFeed.astro';
import GitHubFeed from '@/components/GitHubFeed.astro';
---

<!doctype html>
<html lang="en">
  <head>
    <BaseHead title={SITE_TITLE} description={SITE_DESCRIPTION} />
  </head>
  <body>
    <Header />
    <main>
      <div class="hero">
        <div class="hero-text">
          <p class="eyebrow">Software Engineer &middot; Portland, OR</p>
          <h1 class="hero-name">Nathan Pickard</h1>
          <p class="hero-tagline">Building thoughtful web experiences at the intersection of craft and scale.</p>
          <div class="hero-ctas">
            <a href="/resume" class="btn-primary">View Resume</a>
            <a href="/blog" class="btn-secondary">Read Blog</a>
          </div>
        </div>
        <div class="hero-photo-wrap">
          <Image
            src={ProfileImage}
            alt="Nathan Pickard profile"
            class="profile"
            width={200}
            loading="eager"
            fetchpriority="high"
            densities={[1, 2, 3]}
          />
        </div>
      </div>

      <div class="feeds-section">
        <SectionHeader title="Recent Activity" />
        <div class="feeds">
          <BlueskyFeed />
          <GitHubFeed />
        </div>
      </div>
    </main>
    <Footer />
  </body>
</html>

<style>
  main {
    width: 875px;
    max-width: calc(100% - 2em);
  }

  /* ── Hero ── */
  .hero {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 2rem;
    align-items: center;
    padding: 3rem 0 2.5rem;
    border-bottom: 1px solid #dde8d8;
    margin-bottom: 3rem;
  }

  .eyebrow {
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #2a7d4f;
    margin-bottom: 0.5rem;
  }

  .hero-name {
    margin-bottom: 0.75rem;
  }

  .hero-tagline {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    color: rgb(var(--gray));
    margin-bottom: 1.5rem;
    max-width: 520px;
  }

  .hero-ctas {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .btn-primary,
  .btn-secondary {
    display: inline-block;
    padding: 0.55rem 1.25rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.15s;
  }

  .btn-primary {
    background: #2a7d4f;
    color: #fff;
    border: 2px solid #2a7d4f;
  }

  .btn-secondary {
    background: transparent;
    color: #2a7d4f;
    border: 2px solid #2a7d4f;
  }

  .btn-primary:hover,
  .btn-secondary:hover {
    opacity: 0.85;
    color: inherit;
  }

  /* Photo */
  .hero-photo-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .hero-photo-wrap::after {
    content: '';
    position: absolute;
    inset: 8px -8px -8px 8px;
    border: 2px solid #2a7d4f;
    border-radius: 10px;
    opacity: 0.3;
    z-index: 0;
  }

  .profile {
    border: 3px solid #fff;
    border-radius: 8px;
    display: block;
    position: relative;
    z-index: 1;
  }

  /* ── Feeds ── */
  .feeds-section {
    margin-top: 0;
  }

  .feeds {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
  }

  @media (max-width: 720px) {
    .hero {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      text-align: center;
      padding: 2rem 0 2rem;
    }

    .hero-photo-wrap {
      order: -1;
      margin: 0 auto;
    }

    .hero-photo-wrap::after {
      display: none;
    }

    .hero-ctas {
      justify-content: center;
    }

    .hero-tagline {
      max-width: 100%;
    }

    .feeds {
      flex-direction: column;
    }
  }
</style>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: exits 0, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: redesign homepage with editorial hero and section header"
```

---

## Task 8: Redesign About page

**Files:**
- Modify: `src/pages/about.astro`

Replace the centered photo hero with a two-column photo+text hero. Replace the bullet-list career highlights with left-bordered cards. Replace `<h3>` section headings with `SectionHeader`.

- [ ] **Step 1: Rewrite about.astro**

Replace the entire content of `src/pages/about.astro` with:

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import SectionHeader from '../components/SectionHeader.astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { Image } from 'astro:assets';
import { Icon } from 'astro-icon/components';
import ProfileImage from '../assets/nathan-pickard-profile.jpg';
---

<html lang="en">
  <head>
    <BaseHead title={SITE_TITLE} description={SITE_DESCRIPTION} />
    <style>
      main {
        width: calc(100% - 2em);
        max-width: 100%;
        margin: 0;
        padding: 0;
      }

      /* ── Hero ── */
      .about-hero {
        background: linear-gradient(rgba(216, 234, 220, 0.35), #fafaf8);
        padding: 3rem 2rem;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 2rem;
        align-items: center;
        border-bottom: 1px solid #dde8d8;
      }

      .about-photo {
        width: 180px;
        height: auto;
        border-radius: 12px;
        border: 3px solid #fff;
        box-shadow: 0 4px 20px rgba(42, 125, 79, 0.15);
        display: block;
      }

      .about-hero-text .eyebrow {
        font-size: 0.875rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #2a7d4f;
        margin-bottom: 0.5rem;
      }

      .about-hero-text h1 {
        margin-bottom: 0.5rem;
      }

      .hero-sub {
        font-family: 'Lora', Georgia, serif;
        font-style: italic;
        color: rgb(var(--gray));
        margin-bottom: 0;
      }

      /* ── Prose ── */
      .prose {
        width: 800px;
        max-width: calc(100% - 2em);
        margin: 0 auto;
        padding: 3rem 1em;
        color: rgb(var(--gray-dark));
      }

      p {
        margin-bottom: 1em;
      }

      .about-section {
        padding: 2rem 0;
      }

      .about-section > p:last-child {
        margin-bottom: 0;
      }

      /* ── Highlight cards ── */
      .highlight-cards {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .highlight-card {
        background: #fff;
        border: 1px solid #e8e6e0;
        border-left: 3px solid #2a7d4f;
        border-radius: 0 8px 8px 0;
        padding: 1rem 1.25rem;
        box-shadow: 0 1px 4px rgba(42, 125, 79, 0.05);
      }

      .highlight-card-title {
        font-weight: 700;
        color: rgb(var(--black));
        margin-bottom: 0.35rem;
        font-size: 1rem;
      }

      .highlight-card-body {
        font-size: 0.9rem;
        color: rgb(var(--gray-dark));
        line-height: 1.6;
        margin-bottom: 0;
      }

      /* ── Icon grid ── */
      .icon-grid {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 2rem;
        align-items: flex-start;
      }

      .icon-grid-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.35rem;
      }

      .icon-grid-item span {
        font-size: 1rem;
        text-align: center;
        line-height: 1.2;
      }

      @media (max-width: 720px) {
        .about-hero {
          grid-template-columns: 1fr;
          text-align: center;
          padding: 2rem 1rem;
        }

        .about-photo {
          width: 130px;
          margin: 0 auto;
        }
      }
    </style>
  </head>

  <body>
    <Header />
    <main>
      <article>
        <div class="about-hero">
          <Image
            src={ProfileImage}
            alt="Nathan Pickard profile"
            class="about-photo"
            width={180}
            loading="eager"
            fetchpriority="high"
            densities={[1, 2, 3]}
          />
          <div class="about-hero-text">
            <p class="eyebrow">Software Engineer &middot; Portland, OR</p>
            <h1>Nathan Pickard</h1>
            <p class="hero-sub">6+ years building at the intersection of craft and scale.</p>
          </div>
        </div>

        <div class="prose">
          <div class="about-section">
            <p>Hi there!</p>
            <p>
              I'm Nathan Pickard, a software engineer based in Portland, OR.
              With 6+ years of experience, I focus on building feature-rich,
              cutting-edge web and software solutions that bridge the gap
              between complex architecture and seamless user experiences.
            </p>
            <a href="/resume">View Resume<Icon name="mdi:keyboard-arrow-right" /></a>
          </div>

          <hr />

          <div class="about-section">
            <SectionHeader title="Career Highlights" />
            <div class="highlight-cards">
              <div class="highlight-card">
                <p class="highlight-card-title">Fintech at Scale</p>
                <p class="highlight-card-body">
                  I spent several years deep in the fintech world using Angular, React, and Vue across a 2M+ user platform.
                  My impact resulted in 23% higher conversion rates, 18% better retention, and a company milestone of $200M in originations.
                </p>
              </div>
              <div class="highlight-card">
                <p class="highlight-card-title">Shipping Features That Moved the Needle</p>
                <p class="highlight-card-body">
                  At Kellton I owned offer and refinancing flows end-to-end across a multi-framework codebase at production scale,
                  requiring both technical precision and a clear understanding of what customers actually needed.
                </p>
              </div>
              <div class="highlight-card">
                <p class="highlight-card-title">Recognized for Quality</p>
                <p class="highlight-card-body">
                  The products I helped ship earned top marks in J.D. Power's 2025 and 2024 US Consumer Lending Satisfaction study —
                  recognition that the work held up not just technically, but in the hands of actual customers.
                </p>
              </div>
              <div class="highlight-card">
                <p class="highlight-card-title">Built for the Portland Startup Scene</p>
                <p class="highlight-card-body">
                  At Lazarus Naturals I helped modernize their e-commerce experience and launched their first native app (+24% sales).
                  At Mental Health Match I improved load times by 28% and grew therapist onboarding by 31% in the first three months after relaunch.
                </p>
              </div>
            </div>
          </div>

          <hr />

          <div class="about-section">
            <SectionHeader title="My Technical Toolkit" />
            <p>
              I specialize in the JavaScript and TypeScript ecosystem. I enjoy
              working across the full stack to build responsive, accessible, and
              high-performance applications.
            </p>
            <div class="icon-grid">
              <div class="icon-grid-item">
                <Icon name="devicon:javascript" size={36} />
                <span>JavaScript</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:typescript" size={36} />
                <span>TypeScript</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:python" size={36} />
                <span>Python</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:angular" size={36} />
                <span>Angular</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:react" size={36} />
                <span>React</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:vuejs" size={36} />
                <span>Vue</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:ngrx" size={36} />
                <span>NgRx</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:redux" size={36} />
                <span>Redux</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:tailwindcss" size={36} />
                <span>Tailwind</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:angularmaterial" size={36} />
                <span>Angular Material</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:bootstrap" size={36} />
                <span>Bootstrap</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:nodejs" size={36} />
                <span>Node.js</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:mongodb" size={36} />
                <span>MongoDB</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:mysql" size={36} />
                <span>MySQL</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:amazonwebservices" size={36} />
                <span>AWS</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:docker" size={36} />
                <span>Docker</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:firebase" size={36} />
                <span>Firebase</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:datadog" size={36} />
                <span>Datadog</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:nginx" size={36} />
                <span>Nginx</span>
              </div>
              <div class="icon-grid-item">
                <Icon name="devicon:githubcopilot" size={36} />
                <span>GitHub Copilot</span>
              </div>
            </div>
          </div>

          <hr />

          <div class="about-section">
            <SectionHeader title="Community" />
            <p>
              I'm an active participant in Portland-area tech conferences,
              software engineering meetups, and hackathons focused on AI and
              modern web technologies.
            </p>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  </body>
</html>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: redesign about page with editorial hero and highlight cards"
```

---

## Task 9: Redesign Blog listing page

**Files:**
- Modify: `src/pages/blog/index.astro`

Remove the first-post special treatment. Replace the `<ul>` with a uniform card grid. Add `SectionHeader` with title "Writing". Show post `description` in each card.

- [ ] **Step 1: Rewrite blog/index.astro**

Replace the entire content of `src/pages/blog/index.astro` with:

```astro
---
import { Image } from 'astro:assets';
import { getCollection } from 'astro:content';
import BaseHead from '../../components/BaseHead.astro';
import Footer from '../../components/Footer.astro';
import FormattedDate from '../../components/FormattedDate.astro';
import Header from '../../components/Header.astro';
import SectionHeader from '../../components/SectionHeader.astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../../consts';

const posts = (await getCollection('blog'))
  .filter((p) => !p.data.archived)
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---

<!doctype html>
<html lang="en">
  <head>
    <BaseHead title={`${SITE_TITLE} - Blog`} description={SITE_DESCRIPTION} />
    <style>
      main {
        width: 960px;
      }

      .blog-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .blog-card {
        background: #fff;
        border: 1px solid #e8e6e0;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(42, 125, 79, 0.05);
        transition: box-shadow 0.15s ease, transform 0.1s ease;
      }

      .blog-card:hover {
        box-shadow: var(--box-shadow);
        transform: translateY(-2px);
      }

      .blog-card a {
        display: block;
        text-decoration: none;
        color: inherit;
        height: 100%;
      }

      .card-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 0;
        display: block;
        margin: 0;
      }

      .card-body {
        padding: 1.25rem;
      }

      .card-date {
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #2a7d4f;
        margin-bottom: 0.4rem;
      }

      .card-title {
        font-family: 'Lora', Georgia, serif;
        font-size: 1.15rem;
        font-weight: 700;
        color: rgb(var(--black));
        line-height: 1.3;
        margin-bottom: 0.5rem;
      }

      .card-desc {
        font-size: 0.9rem;
        color: rgb(var(--gray));
        line-height: 1.5;
        margin-bottom: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .archived-link {
        display: block;
        font-size: 0.9rem;
        color: rgb(var(--gray));
        margin-top: 0.5rem;
      }

      @media (max-width: 720px) {
        .blog-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <Header />
    <main>
      <SectionHeader title="Writing" />
      <div class="blog-grid">
        {
          posts.map((post) => (
            <div class="blog-card">
              <a href={`/blog/${post.id}/`}>
                {post.data.heroImage && (
                  <Image
                    width={720}
                    height={360}
                    src={post.data.heroImage}
                    alt=""
                    class="card-image"
                  />
                )}
                <div class="card-body">
                  <p class="card-date">
                    <FormattedDate date={post.data.pubDate} />
                  </p>
                  <h4 class="card-title">{post.data.title}</h4>
                  {post.data.description && (
                    <p class="card-desc">{post.data.description}</p>
                  )}
                </div>
              </a>
            </div>
          ))
        }
      </div>
      <a href="/blog/archived" class="archived-link">View archived posts →</a>
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "feat: redesign blog listing with uniform card grid and section header"
```

---

## Task 10: Final visual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:4321` and verify each page:

| Page | Check |
|---|---|
| `/` (homepage) | Hero has eyebrow, serif name, italic tagline, two CTA buttons, photo with accent border. "Recent Activity" section header before feeds. Feed cards have warm borders. |
| `/about` | Two-column hero with photo + name/tagline. Career highlight cards with green left border. SectionHeader before each section. |
| `/blog` | "Writing" section header. Uniform 2-column card grid with green date, serif title, description. |
| All pages | Green accent (links, underlines). Warm off-white background. Lora on headings. Dark footer with nav links. |
| Mobile (`≤720px`) | Homepage hero stacks vertically, photo on top. About hero stacks, photo centered. Blog grid goes single-column. Footer nav goes horizontal. |

- [ ] **Step 2: Final build check**

```bash
npm run build
```

Expected: exits 0, `dist/` produced cleanly.
