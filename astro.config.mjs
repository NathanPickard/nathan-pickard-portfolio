// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField, fontProviders } from 'astro/config';

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

  fonts: [
    {
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      provider: fontProviders.google(),
      weights: [300, 400, 500, 600, 700, 800, 900],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['serif'],
      options: {
        experimental: {
          variableAxis: {
            opsz: [['9', '144']],
          },
        },
      },
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
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      provider: fontProviders.google(),
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
  ],

  integrations: [
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
        ],
        devicon: ['*'],
        local: ['src/icons'],
      },
    }),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
