// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField } from 'astro/config';

import icon from 'astro-icon';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      GITHUB_TOKEN: envField.string({ context: 'server', access: 'secret' }),
    },
  },
  site: 'https://nathanpickard.com/',

  integrations: [
    mdx(),
    sitemap(),
    icon({
      include: {
        local: ['src/icons'],
      },
    }),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
