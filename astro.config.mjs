// File: astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import sanity from '@sanity/astro';

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

  // ✅ Usa Squoosh (WASM) -> compatibile con Cloudflare Pages, evita moduli Node
  image: {
    service: {
      entrypoint: 'astro/assets/services/squoosh'
    }
  },

  integrations: [
    tailwind(),
    sanity({
      projectId: '1avzsmsi',
      dataset: 'production',
      studio: { base: '/admin' }
    })
  ],

  vite: {
    plugins: [silenceSanityUseCdnWarn()]
  }
});
