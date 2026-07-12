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

Open a pull request in Forgejo, review the rendered changes and build result, then merge into `main`. The Forgejo push mirror copies `main` to GitHub.

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

Pushing to Forgejo or GitHub saves the source but does not currently deploy the website. Production is a Cloudflare Worker, not a Cloudflare Pages project.

Deploy only from a clean, current `main` working tree:

```powershell
cd "C:\Workspaces\Claude\Projects\HoLEP-Site\site"
git switch main
git pull --ff-only origin main
git status --short

npm.cmd ci
npm.cmd run build
npx.cmd wrangler deploy
```

Before deploying, verify that `git status --short` is empty and that the build succeeds. A successful changed deployment reports new or modified static assets.

Cloudflare authentication is local operator state. Never commit `.env` files, API tokens, Wrangler credentials, SSH private keys, or other secrets.

## Post-deployment checks

- Visit `https://drquarrier.com` and check all primary navigation links.
- Test `/holep`, `/symptom-check`, `/faq`, and `/404` behavior.
- Verify `/robots.txt`, `/ai.txt`, and `/sitemap.xml`.
- Check the `*.workers.dev` URL first when diagnosing edge-cache differences.
- If necessary, purge the affected URLs from Cloudflare's cache.

## AI crawler settings

The permissive `public/robots.txt` and `public/ai.txt` are intentional. If Cloudflare injects a managed block for GPTBot, ClaudeBot, or Google-Extended, change the setting in the `drquarrier.com` Cloudflare zone under AI Crawl Control. That behavior is controlled by Cloudflare, not this repository.

## Windows troubleshooting

- Use `npm.cmd` and `npx.cmd` if PowerShell blocks the script shims.
- If Rollup reports `ERR_MODULE_NOT_FOUND` for an optional dependency, remove `node_modules`, then run `npm.cmd ci` again.
- Do not use the retired OneDrive or `C:\Claude` copies as working trees.

## Repository contents

The repository contains only the deployable website source. Research notes, drafts, citations, credentials, and private Hermes state belong outside this repository.
