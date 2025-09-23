import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://copycodeart.pages.dev", // poi lo aggiorni col dominio vero
  integrations: [tailwind()],
  output: "static",
});
