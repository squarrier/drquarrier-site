# Deployment migration notes

`DEPLOY.md` is the current runbook. This file records the migration context that may help with future troubleshooting.

## Current architecture

- Forgejo on Beast is the primary Git service.
- Forgejo push-mirrors only protected `main` to GitHub; working branches remain private in Forgejo.
- GitHub `main` is the Cloudflare Workers Builds source.
- A reviewed merge to Forgejo `main` is the normal production trigger: mirror to GitHub, build `./dist`, then `wrangler deploy`.
- The live site is the Cloudflare Worker `drquarrier-site`, exposed at `drquarrier.com` and its `*.workers.dev` address.

Manual `wrangler deploy` is recovery-only. The authoritative workflow and verification steps are in `DEPLOY.md`.

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
- Cloudflare Workers Builds uses Node `22.12.0`, runs `npm run build`, and then runs `npx wrangler deploy`.
- Cloudflare AI Crawl Control can override repository crawler files. Keep `public/robots.txt` and `public/ai.txt` permissive unless the site policy intentionally changes.
