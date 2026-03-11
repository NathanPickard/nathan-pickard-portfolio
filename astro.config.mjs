// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import icon from 'astro-icon';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',

  integrations: [
      mdx(),
      sitemap(),
      icon({
          include: {
              local: ['src/icons'],
          },
      }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});