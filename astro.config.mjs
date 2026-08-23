// @ts-check
import { defineConfig } from 'astro/config';
import remarkAbbr from './src/lib/remark-abbr.mjs';
import remarkRouteSlashes from './src/lib/remark-route-slashes.mjs';

// Set to the production domain. Used for canonical URLs, sitemap, og:url, JSON-LD @id.
export default defineConfig({
  site: 'https://drquarrier.com',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkAbbr, remarkRouteSlashes],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
