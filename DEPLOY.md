# drquarrier.com development and deployment

This repository contains the Astro source for `https://drquarrier.com`.

## Source of truth

- Primary repository: `http://192.168.0.11:3030/squarrier/drquarrier-site`
- GitHub: downstream mirror of the protected `main` branch
- Current Windows working copy: `C:\Workspaces\Claude\Projects\HoLEP-Site\site`
- Production: Cloudflare Worker named `drquarrier-site`, serving the static `./dist` directory

Do not edit or build from the retired OneDrive copy. Do not push directly to GitHub; Forgejo is the primary repository.

## Normal development workflow

Start from an up-to-date `main` and work on a short-lived branch:

```powershell
cd "C:\Workspaces\Claude\Projects\HoLEP-Site\site"
git switch main
git pull --ff-only origin main
git switch -c feature/<short-description>

npm.cmd ci
npm.cmd run build

git add <files>
git commit -m "Describe the change"
git push -u origin feature/<short-description>
```

Open a pull request in Forgejo, review the rendered changes and build result, then merge into `main`.

Forgejo 15 automatically push-mirrors only protected `main` to GitHub using the repository-scoped, write-enabled SSH deploy key named `Forgejo main-only mirror`. `sync_on_commit` is enabled and the periodic fallback interval is eight hours.

After a reviewed Forgejo pull request merges, confirm Forgejo's mirror status has no error and verify both remotes resolve `refs/heads/main` to the same commit. Do not manually push working branches to GitHub.

The mirror branch filter must remain exactly `main`. Never broaden it or add an all-branches mirror: doing so would publish unreviewed agent branches. The GitHub deploy key must remain scoped to this repository only.

Agents such as Hermes should push only agent-specific branches such as `hermes/<task-name>`. They must not force-push or push directly to `main`.

## Local preview

```powershell
npm.cmd ci
npm.cmd run dev
```

Astro serves the preview at `http://localhost:4321` by default.

To regenerate content from the parent project's drafts:

```powershell
node scripts/clean-content.mjs
```

Review every generated content change before committing it.

## Production deployment

Merging a reviewed Forgejo pull request into protected `main` starts the complete production path automatically:

1. Forgejo push-mirrors only `main` to GitHub.
2. Cloudflare Workers Builds detects the new GitHub `main` commit.
3. Cloudflare runs `npm run build` and then `npx wrangler deploy`.
4. The resulting static Worker is published to `drquarrier.com` and the `*.workers.dev` address.

Cloudflare's production branch is `main`, the build variable `NODE_VERSION` is `22.12.0`, and non-production branch builds remain enabled for validation. Keep the Cloudflare build token narrowly scoped and managed by Cloudflare; never copy it into this repository.

After each merge, confirm the same commit reached Forgejo, GitHub, and the Cloudflare build record. A successful build must report 13 generated pages and a completed deploy command.

Use a manual deployment only as a recovery procedure when the automatic build service is unavailable. Deploy from a clean, current `main` working tree:

```powershell
cd "C:\Workspaces\Claude\Projects\HoLEP-Site\site"
git switch main
git pull --ff-only origin main
git status --short

npm.cmd ci
npm.cmd run build
npx.cmd wrangler deploy
```

Before a manual deployment, verify that `git status --short` is empty and that the build succeeds. A successful changed deployment reports new or modified static assets.

Manual Cloudflare authentication is local operator state. Never commit `.env` files, API tokens, Wrangler credentials, SSH private keys, or other secrets.

## Post-deployment checks

- Visit `https://drquarrier.com` and check all primary navigation links.
- Test `/holep`, `/symptom-check`, `/faq`, and `/404` behavior.
- Verify `/robots.txt`, `/ai.txt`, and `/sitemap.xml`.
- Check the `*.workers.dev` URL first when diagnosing edge-cache differences.
- If necessary, purge the affected URLs from Cloudflare's cache.

## Contact form security

`src/components/ContactForm.astro` posts directly from the browser to Web3Forms. Its access key is intentionally client-visible and is not a secret API credential; Web3Forms expects this API to run client-side. The form uses a honeypot and provider-side rate limiting. If spam becomes material, enable Web3Forms domain restriction or CAPTCHA in the provider dashboard; domain restriction is a paid feature. Do not move the current request behind a Worker proxy unless Web3Forms server-side access has been explicitly enabled for the account.

## AI crawler settings

The permissive `public/robots.txt` and `public/ai.txt` are intentional. If Cloudflare injects a managed block for GPTBot, ClaudeBot, or Google-Extended, change the setting in the `drquarrier.com` Cloudflare zone under AI Crawl Control. That behavior is controlled by Cloudflare, not this repository.

## Windows troubleshooting

- Use `npm.cmd` and `npx.cmd` if PowerShell blocks the script shims.
- If Rollup reports `ERR_MODULE_NOT_FOUND` for an optional dependency, remove `node_modules`, then run `npm.cmd ci` again.
- Do not use the retired OneDrive or `C:\Claude` copies as working trees.

## Repository contents

The repository contains only the deployable website source. Research notes, drafts, citations, credentials, and private Hermes state belong outside this repository.
