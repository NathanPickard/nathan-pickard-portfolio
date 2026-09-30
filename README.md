# nathanpickard.com

This repository powers my personal portfolio website, built using [Astro](https://astro.build).

[![Netlify Status](https://api.netlify.com/api/v1/badges/04e5e1d9-22fb-4159-bd2e-9a195e300b2f/deploy-status)](https://app.netlify.com/projects/nathanpickard/deploys)

## 🧩 What's in this project

- **Framework:** Astro with TypeScript
- **Styling:** Tailwind CSS v4 utilities alongside scoped component styles and global CSS variables
- **Content:** static pages (`index`, `about`, `work`, `resume`) and blog posts stored as Markdown/MDX in `src/content/blog`
- **Resume:** `src/data/resume.json` drives both the `/resume` page and a downloadable PDF rendered with React PDF
- **Icons:** `astro-icon` integration with both Iconify sets and local SVGs (`src/icons`)
- **Configuration:** see `astro.config.mjs` for integrations (MDX, sitemap, icons, Expressive Code, React)

## 🚀 Getting Started

This project uses [pnpm](https://pnpm.io).

```sh
pnpm install         # install dependencies
pnpm dev             # start development server
pnpm build           # produce static files in dist/
pnpm preview         # locally preview the production build
pnpm test            # run Vitest unit/integration tests
pnpm test:e2e        # build + run Playwright smoke tests
pnpm test:e2e:ui     # open the Playwright UI runner
pnpm test:e2e:report # view the last Playwright report
pnpm knip            # find unused files, exports, and dependencies
```

## 🛠 Adding content or icons

- **Blog posts:** create or edit Markdown files under `src/content/blog/`. Frontmatter is typed via schema.
- **Pages & components:** add `.astro` files inside `src/pages` or `src/components` as needed.
- **Local icons:** drop SVGs into `src/icons`; the config already includes that directory. Reference them with `<Icon name="icon-name" />`.

## 📦 Dependencies

Key packages used:

- `astro`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss` – core framework, integrations, and RSS feed
- `tailwindcss`, `@tailwindcss/vite` – utility-first styling
- `astro-expressive-code` – syntax-highlighted code blocks in blog posts
- `mermaid` – diagrams in blog posts
- `@astrojs/react`, `react`, `@react-pdf/renderer` – renders the resume PDF
- `astro-icon` – simple SVG icon component
- `@iconify-json/devicon`, `@iconify-json/mdi` – icon sets used on the site
- `vitest`, `@playwright/test` – unit/integration and end-to-end tests

## 📁 Project Structure

```text
├── fonts/              # font files embedded in the resume PDF
├── public/             # static assets served as-is
├── src/
│   ├── assets/         # images processed by Astro (hero and placeholder photos)
│   ├── components/     # reusable UI pieces (Header, Footer, etc.)
│   ├── content/        # markdown collections (blog posts)
│   ├── data/           # resume and work data
│   ├── icons/          # local SVG icons for astro-icon
│   ├── layouts/        # page layouts (e.g. blog post layout)
│   ├── pages/          # route entry points (index.astro, about.astro, ...)
│   └── utils/          # shared helpers (reading time, feed cache, Mermaid plugin)
├── tests/e2e/          # Playwright end-to-end tests
├── astro.config.mjs    # Astro configuration and integrations
├── package.json        # project metadata & dependencies
└── tsconfig.json       # TypeScript configuration
```

## 🚧 Deployment

Build output lands in `dist/` and can be deployed to any static hosting provider (Netlify, Vercel, GitHub Pages, etc.).

## 📄 License & Credits

All content and code is owned by Nathan Pickard. Feel free to fork or adapt this project for your own use. Please attribute if you reuse significant portions.
