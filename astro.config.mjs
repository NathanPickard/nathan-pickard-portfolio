// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField, fontProviders } from 'astro/config';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import rehypeExternalLinks from 'rehype-external-links';
import { visualizer } from 'rollup-plugin-visualizer';

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      GITHUB_TOKEN: envField.string({ context: 'server', access: 'secret' }),
    },
  },
  site: 'https://nathanpickard.com/',

  fonts: [
    {
      name: 'Cormorant Garamond',
      cssVariable: '--font-cormorant',
      provider: fontProviders.google(),
      weights: [300, 400, 500, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
    {
      name: 'Vollkorn',
      cssVariable: '--font-vollkorn',
      provider: fontProviders.google(),
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
    {
      name: 'EB Garamond',
      cssVariable: '--font-eb-garamond',
      provider: fontProviders.google(),
      weights: [400, 500, 600, 700, 800],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
    {
      name: 'Inter',
      cssVariable: '--font-inter',
      provider: fontProviders.google(),
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      name: 'DM Sans',
      cssVariable: '--font-dm-sans',
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
      styleOverrides: {
        borderRadius: '0.5rem',
        codeFontFamily: 'Menlo, Monaco, "Courier New", monospace',
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
        devicon: ['*'],
        local: ['src/icons'],
      },
    }),
    react(),
  ],

  markdown: {
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
  },

  vite: {
    plugins: [
      tailwindcss(),
      visualizer({
        emitFile: true,
        filename: 'stats.html',
      }),
    ],
  },
});
