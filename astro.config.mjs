// File: astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: "https://copycodeai-bki.pages.dev",
  output: 'server',
  adapter: cloudflare({ mode: 'directory' } ),
  integrations: [tailwind()],
});
