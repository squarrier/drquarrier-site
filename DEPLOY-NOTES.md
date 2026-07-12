# Deployment migration notes

`DEPLOY.md` is the current runbook. This file records the migration context that may help with future troubleshooting.

## Current architecture

- Forgejo on Beast is the primary Git service.
- GitHub is a downstream mirror of `main`.
- The live site is a Cloudflare Worker named `drquarrier-site` serving `./dist`.
- Repository pushes do not currently publish the Worker; deployment remains an explicit build and `wrangler deploy` step.

## Retired workflow

The site previously lived under OneDrive. Builds from that location sometimes uploaded stale `dist` content even after a successful local build. The active working copy is now outside OneDrive at:

`C:\Workspaces\Claude\Projects\HoLEP-Site\site`

Do not restore commands that copy from or build inside the retired OneDrive tree. The older `C:\Claude` copy is also stale and must not be used as a source.

## Known Windows issues

- Use `npm.cmd` and `npx.cmd` when PowerShell execution policy blocks the script shims.
- A Rollup `parseAst` or optional-dependency `ERR_MODULE_NOT_FOUND` error is usually corrected by removing `node_modules` and running `npm.cmd ci` again.
- A config-only change such as `wrangler.jsonc` still requires `wrangler deploy`, but not a content rebuild unless site assets also changed.

## Cloudflare behavior

- The `*.workers.dev` URL is the quickest way to distinguish a new Worker deployment from stale edge cache on `drquarrier.com`.
- Cloudflare AI Crawl Control can override repository crawler files. Keep `public/robots.txt` and `public/ai.txt` permissive unless the site policy intentionally changes.
