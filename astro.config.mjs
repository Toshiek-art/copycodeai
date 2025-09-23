// File: astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import cloudflare from '@astrojs/cloudflare';
import sanity from '@sanity/astro'; // <-- Assicurati che sia importato

export default defineConfig({
  site: "https://copycodeai-bki.pages.dev",
  output: 'server',
  adapter: cloudflare({ mode: 'directory' } ),
  integrations: [
    tailwind(),
    sanity({ // <-- Aggiungi o modifica questa sezione
      projectId: '1avzsmsi', // Lo trovi in sanity.json o sanity.cli.ts
      dataset: 'production', // O il nome del tuo dataset
      studio: {
        base: '/admin' // <-- ECCO LA RIGA FONDAMENTALE!
      }
    })
  ],
});
