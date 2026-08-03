import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const origin = 'https://drquarrier.com';
const routePaths = new Set(['/']);

async function collectHtml(dirUrl, relative = '') {
  for (const entry of await readdir(dirUrl, { withFileTypes: true })) {
    const nextRelative = path.posix.join(relative, entry.name);
    const nextUrl = new URL(`${nextRelative}${entry.isDirectory() ? '/' : ''}`, dirUrl);
    if (entry.isDirectory()) await collectHtml(nextUrl, nextRelative);
    if (entry.isFile() && entry.name === 'index.html') {
      const route = relative ? `/${relative}/` : '/';
      if (route !== '/404/') routePaths.add(route);
    }
  }
}

await collectHtml(dist);

const notFoundHtml = await readFile(new URL('404.html', dist), 'utf8');
assert.match(
  notFoundHtml,
  /<meta name="robots" content="noindex, follow"/i,
  'direct custom-404 URL must be explicitly excluded from indexing',
);

const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8');
const wrangler = JSON.parse((await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8')).replace(/\/\/.*$/gm, ''));
assert.equal(
  wrangler.assets?.html_handling,
  'force-trailing-slash',
  'Cloudflare must serve the same trailing-slash URL form emitted by Astro',
);
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
assert.equal(sitemapUrls.length, routePaths.size, 'sitemap must contain every indexable built route exactly once');
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'sitemap URLs must be unique');

for (const route of [...routePaths].sort()) {
  const expected = `${origin}${route}`;
  assert.ok(sitemapUrls.includes(expected), `sitemap missing canonical URL ${expected}`);

  const file = route === '/' ? new URL('index.html', dist) : new URL(`.${route}index.html`, dist);
  const html = await readFile(file, 'utf8');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  assert.equal(canonical, expected, `${route} canonical must match its served trailing-slash URL`);

  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (href.startsWith('#') || href.startsWith('?')) continue;
    const url = new URL(href, `${origin}${route}`);
    if (url.origin !== origin || /\.[^/]+$/.test(url.pathname)) continue;
    assert.ok(url.pathname === '/' || url.pathname.endsWith('/'), `${route} links to redirecting internal URL ${href}`);
  }
}

console.log(`Indexing contract OK: ${routePaths.size} canonical routes, no redirecting internal page links.`);
