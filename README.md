# nathanpickard.com

This repository powers my personal portfolio website, built using [Astro](https://astro.build).

## 🧩 What's in this project

- **Framework:** Astro with TypeScript
- **Styling:** simple CSS variables and components under `src/components/`
- **Content:** static pages (`about`, `index`) and blog posts stored as Markdown/MDX in `src/content/blog`
- **Icons:** `astro-icon` integration with both Iconify sets and local SVGs (`src/icons`)
- **Configuration:** see `astro.config.mjs` for integrations (MDX, sitemap, icons)

## 🚀 Getting Started

```sh
npm install          # install dependencies
npm run dev          # start development server
npm run build        # produce static files in dist/
npm run preview      # locally preview the production build
```

## 🛠 Adding content or icons

- **Blog posts:** create or edit Markdown files under `src/content/blog/`. Frontmatter is typed via schema.
- **Pages & components:** add `.astro` files inside `src/pages` or `src/components` as needed.
- **Local icons:** drop SVGs into `src/icons`; the config already includes that directory. Reference them with `<Icon name="icon-name" />`.

## 📦 Dependencies

Key packages used:

- `astro`, `@astrojs/mdx`, `@astrojs/sitemap` – core framework and integrations
- `astro-icon` – simple SVG icon component
- `@iconify-json/devicon`, `@iconify-json/mdi` – icon sets used on the site

## 📁 Project Structure

```text
├── public/             # static assets served as-is
├── src/
│   ├── components/     # reusable UI pieces (Header, Footer, etc.)
│   ├── content/        # markdown collections (blog posts)
│   ├── icons/          # local SVG icons for astro-icon
│   ├── layouts/        # page layouts (e.g. blog post layout)
│   └── pages/          # route entry points (index.astro, about.astro, ...)
├── astro.config.mjs    # Astro configuration and integrations
├── package.json        # project metadata & dependencies
└── tsconfig.json       # TypeScript configuration
```

## 🚧 Deployment

Build output lands in `dist/` and can be deployed to any static hosting provider (Netlify, Vercel, GitHub Pages, etc.).

## 📄 License & Credits

All content and code is owned by Nathan Pickard. Feel free to fork or adapt this project for your own use. Please attribute if you reuse significant portions.

