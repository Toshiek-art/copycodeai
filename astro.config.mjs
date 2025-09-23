// File: astro.config.mjs

import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: "https://copycodeai.pages.dev", // Aggiornato al dominio corretto

  output: 'server', // <-- MODIFICA FONDAMENTALE

  adapter: cloudflare({ // <-- AGGIUNTA FONDAMENTALE
    mode: 'directory'
  } ),

  integrations: [
    tailwind()
    // Aggiungi qui altre integrazioni se ne hai
  ],
});
