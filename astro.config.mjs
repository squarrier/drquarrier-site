// @ts-check
import { defineConfig } from 'astro/config';

// Set to the production domain. Used for canonical URLs, sitemap, og:url, JSON-LD @id.
export default defineConfig({
  site: 'https://drquarrier.com',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
});
