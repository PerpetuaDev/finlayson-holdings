import { defineConfig } from 'astro/config';

// Static output; /en and /ja are real routes. The root index does
// client-side locale negotiation (localStorage 'fh_lang' → navigator.language).
// SITE/BASE_PATH come from CI (GitHub Pages project subpath); local dev uses '/'.
export default defineConfig({
  site: process.env.SITE ?? 'https://finlaysonholdings.com',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});
