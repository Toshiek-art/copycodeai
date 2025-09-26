// File: astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import path from 'node:path';

// Dev-only: silenzia il warning "Since you haven't set a value for `useCdn`"
const silenceSanityUseCdnWarn = () => ({
  name: 'silence-sanity-usecdn-warn',
  apply: 'serve',
  configureServer() {
    const origWarn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes("Since you haven't set a value for `useCdn`")) return;
      origWarn(...args);
    };
  }
});

export default defineConfig({
  site: 'https://copycodeai-bki.pages.dev',
  output: 'server',
  adapter: cloudflare({ mode: 'directory' }),

  // Usa Squoosh (WASM) -> compatibile con Cloudflare Pages
  image: {
    service: {
      entrypoint: 'astro/assets/services/squoosh',
    },
  },

  integrations: [
    tailwind(),
    react({
      include: ['**/studio/**', '**/@sanity/**']
    }),
    sanity({
      projectId: '1avzsmsi',
      dataset: 'production',
      studioBasePath: '/admin/studio', // Studio protetto da Access ma separato dalla dashboard
      // Suggerimento: puoi anche settare esplicitamente useCdn per evitare il warn:
      // useCdn: true,
    }),
  ],

  vite: {
    plugins: [silenceSanityUseCdnWarn()],
    resolve: {
      alias: {
        '@layouts': path.resolve('./src/layouts'),
        '@themes': path.resolve('./src/themes'),
        '@core': path.resolve('./src/themes/core'),
        '@components': path.resolve('./src/components'),
        '@styles': path.resolve('./src/styles'),
      },
    },
  },
});
