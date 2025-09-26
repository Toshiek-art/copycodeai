// File: astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import path from 'node:path';

const parseBoolean = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return fallback;
};

const sanityUseCdn = (() => {
  const raw = process.env.SANITY_USE_CDN;
  if (typeof raw === 'string') return parseBoolean(raw, false);
  // Cloudflare Pages build environment struggles to resolve *.apicdn.sanity.io.
  // Default to the live API (no CDN) unless explicitly enabled via env.
  return false;
})();

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
      useCdn: sanityUseCdn,
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
