// @ts-check
import { defineConfig } from 'astro/config';
import remarkAbbr from './src/lib/remark-abbr.mjs';

// Set to the production domain. Used for canonical URLs, sitemap, og:url, JSON-LD @id.
export default defineConfig({
  site: 'https://drquarrier.com',
  trailingSlash: 'never',
  markdown: {
    remarkPlugins: [remarkAbbr],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
