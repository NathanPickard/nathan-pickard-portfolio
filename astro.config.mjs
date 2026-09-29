// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField, fontProviders } from 'astro/config';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import rehypeExternalLinks from 'rehype-external-links';
import { remarkAlert } from 'remark-github-blockquote-alert';
import { remarkMermaid } from './src/utils/remarkMermaid';
import { remarkReadingTime } from './src/utils/readingTime';
import { unified } from '@astrojs/markdown-remark';
import { visualizer } from 'rollup-plugin-visualizer';

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {},
  },
  site: 'https://nathanpickard.com/',

  // Astro resolves the content-layer store as `isDev ? dotAstroDir : cacheDir`.
  // With the default cacheDir (node_modules/.astro), `astro sync` writes the
  // store where the dev-mode runtime — which is what Vitest uses — never reads
  // it, so getCollection() returns nothing until a dev server or build has run.
  // Pointing cacheDir at .astro collapses both branches to one directory.
  cacheDir: './.astro',

  // One web font per type role. Components reference the role variable
  // (--font-heading, --font-body, --font-ui), never the typeface, so swapping a
  // face is a change here only; --font-mono is a system stack in BaseLayout.
  // Google serves these as variable fonts, so each family/style pair is one
  // file no matter how many weights are listed. Weights and styles are still
  // trimmed to what src/ actually uses: every declared weight emits its own
  // @font-face descriptor (plus a fallback one) inline in every page's <head>.
  fonts: [
    {
      // Wordmark, page titles, and section headings. Italic is for figure
      // captions in blog posts.
      name: 'EB Garamond',
      cssVariable: '--font-heading',
      provider: fontProviders.google(),
      weights: [400, 500, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
    {
      // Body text, nav, and buttons on every page. 600 is the site's one bold
      // weight. Italic covers <em>, blockquotes, and the home eyebrow so the
      // browser never synthesizes a fake slant.
      name: 'Source Serif 4',
      cssVariable: '--font-body',
      provider: fontProviders.google(),
      weights: [400, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
    {
      // Dates, tags, labels, and the table of contents.
      name: 'DM Sans',
      cssVariable: '--font-ui',
      provider: fontProviders.google(),
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
  ],

  integrations: [
    expressiveCode({
      themes: ['one-dark-pro'],
      // Wrap long lines instead of scrolling sideways, so on phones the end of
      // a line (often the part the post is pointing at) stays visible. Wrapped
      // lines keep their indentation.
      defaultProps: { wrap: true },
      styleOverrides: {
        borderRadius: '0.5rem',
        // Defined once in BaseLayout's :root, shared with inline code.
        codeFontFamily: 'var(--font-mono)',
        codeFontSize: '14px',
        // Keep One Dark's token colors but sit the block on the site's green
        // surfaces instead of One Dark's gray. Expressive Code's build-time
        // contrast fix only knows the theme's own background, not these CSS
        // variables, so recheck token contrast if either color changes.
        codeBackground: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        uiFontFamily: 'var(--font-ui)',
        // Highlighted lines (`{3}` in a fence) use the site's gold accent
        // instead of One Dark's blue. Literal colors, not CSS variables, so the
        // plugin's contrast check can read them: the background is
        // --color-accent blended at 16% over --color-card.
        textMarkers: {
          markBackground: '#34401f',
          markBorderColor: '#d4af37',
        },
        frames: {
          editorTabBarBackground: 'var(--color-bg)',
          editorTabBarBorderBottomColor: 'var(--color-border)',
          editorActiveTabBackground: 'var(--color-card)',
          editorActiveTabIndicatorBottomColor: 'var(--color-accent)',
        },
      },
    }),
    mdx(),
    sitemap(),
    icon({
      include: {
        mdi: [
          'coffee',
          'hiking',
          'pot-steam',
          'pine-tree',
          'pine-tree-variant-outline',
          'download',
          'email-outline',
          'message-outline',
          'repeat',
          'heart-outline',
          'menu',
          'close',
          'star-outline',
          'linkedin',
        ],
        // Only the devicon icons actually referenced in src/ (workIconMap.ts,
        // Nav/Footer, tests). Using ['*'] pulls the entire devicon set into the
        // build — slower builds and more Netlify credits. Keep this list in sync
        // when adding tech icons.
        devicon: [
          'amazonwebservices',
          'angular',
          'angularmaterial',
          'ansible',
          'bootstrap',
          'css3',
          'datadog',
          'docker',
          'firebase',
          'github',
          'html5',
          'jasmine',
          'javascript',
          'karma',
          'linkedin',
          'mocha',
          'mongodb',
          'mysql',
          'nginx',
          'nodejs',
          'pytest',
          'python',
          'python-wordmark',
          'react',
          'redux',
          'sass',
          'tailwindcss',
          'twitter',
          'typescript',
          'vitest',
          'vuejs',
        ],

        local: ['src/icons'],
      },
    }),
    react(),
  ],

  markdown: {
    // Astro 7 made Sätteri the default Markdown processor. Stay on Unified: it
    // is what this site's content has always been rendered with, and
    // rehype-external-links is a rehype plugin with no Sätteri equivalent.
    // The old top-level `rehypePlugins` key is deprecated and now throws,
    // because @astrojs/mdx v8 dropped @astrojs/markdown-remark to a peer.
    processor: unified({
      // GitHub-style alerts: `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`,
      // `[!CAUTION]`. Styled under `.prose .markdown-alert` in BlogPost.astro.
      // ```mermaid fences become <pre class="mermaid">, drawn client-side by the
      // script in BlogPost.astro. remarkReadingTime adds `minutesRead` to each
      // post's remarkPluginFrontmatter.
      remarkPlugins: [remarkAlert, remarkMermaid, remarkReadingTime],
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            target: '_blank',
            rel: ['noopener', 'noreferrer'],
            // content: { type: 'text', value: ' 🔗' }
          },
        ],
      ],
    }),
  },

  vite: {
    plugins: [
      tailwindcss(),
      // Bundle-size visualizer emits stats.html. Skip it on Netlify (NETLIFY=true
      // in their build env) to keep CI builds lean; still runs locally.
      ...(process.env.NETLIFY
        ? []
        : [
            visualizer({
              emitFile: true,
              filename: 'stats.html',
            }),
          ]),
    ],
  },
});
