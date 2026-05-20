# Deploying drquarrier.com

The site is a static Astro build. Recommended host: **Cloudflare Pages** (free, fast, automatic TLS, builds from GitHub on every push). You own `drquarrier.com` at GoDaddy; you keep the registration there and just point DNS at Cloudflare.

You should never need to run `npm install` locally — Cloudflare builds it in CI.

---

## 0. Prerequisite — get Git (one time)

`git` isn't installed yet (that's the "not recognized" error). Two options:

- **GitHub Desktop (recommended — no command line):** download from desktop.github.com, install, sign in with a free GitHub account. It bundles Git and handles everything with a GUI. Then use the "GitHub Desktop path" below instead of the terminal commands.
- **Git CLI:** download from git-scm.com/download/win, install with defaults, then **close and reopen PowerShell** so it's on your PATH. The terminal commands below will then work.

### GitHub Desktop path (easiest)

1. Install GitHub Desktop, sign in.
2. **File → Add local repository →** browse to `C:\Users\squar\OneDrive\Documents\Claude\Projects\HoLEP-Site\site`. It'll say "this isn't a Git repository — create one?" → **Create a repository** → Create.
3. It shows all the files as the first commit. Add a summary like "Initial site" → **Commit to main**.
4. Click **Publish repository** → name it `drquarrier-site`, keep **"Keep this code private"** checked → Publish.
5. Skip to **section 2** (Cloudflare Pages) — your repo is now on GitHub.

> Note: GitHub Desktop respects the `.gitignore`, so `node_modules/` and `dist/` are excluded automatically.

## 1. (Git CLI alternative) Put `site/` in a GitHub repo

The repo should contain the **contents of `site/`** (this folder), not the whole HoLEP-Site project — that keeps your research notes, drafts, and citations private.

After installing Git CLI and reopening PowerShell, from inside `site/`:

```bash
cd "C:\Users\squar\OneDrive\Documents\Claude\Projects\HoLEP-Site\site"
git init
git add .
git commit -m "Initial commit: drquarrier.com Astro site"
```

`.gitignore` already excludes `node_modules/`, `dist/`, and `.astro/`, so only source gets committed.

Then create an empty repo on GitHub (e.g., `drquarrier-site`, private is fine — Cloudflare can read private repos) and push:

```bash
git remote add origin https://github.com/<your-username>/drquarrier-site.git
git branch -M main
git push -u origin main
```

> **OneDrive note:** this folder lives in OneDrive. Git works fine there, but pause OneDrive sync while running `git`/`npm` if you ever see file-lock errors. (You don't need `npm install` locally for deployment.)

---

## 2. Connect Cloudflare Pages

1. Create a free account at dash.cloudflare.com.
2. **Workers & Pages → Create → Pages → Connect to Git** → authorize GitHub → pick `drquarrier-site`.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (leave default — the repo root *is* the site)
   - **Environment variable:** add `NODE_VERSION` = `20` (or `22`)
4. **Save and Deploy.** First build takes ~1–2 minutes. You'll get a `*.pages.dev` preview URL — open it and confirm the site renders.

Every `git push` to `main` redeploys automatically.

---

## 3. Point drquarrier.com at Cloudflare

Cloudflare Pages serves the custom domain through Cloudflare DNS, so move DNS to Cloudflare (keep the registration at GoDaddy):

1. In Cloudflare: **Add a site → `drquarrier.com` → Free plan.** Cloudflare scans existing DNS and shows you **two nameservers** (like `xxx.ns.cloudflare.com`).
2. In GoDaddy: **My Products → drquarrier.com → DNS → Nameservers → Change → Enter my own nameservers** → paste the two Cloudflare nameservers → save. Propagation is usually under an hour.
3. Back in Cloudflare Pages → your project → **Custom domains → Set up a custom domain** → add `drquarrier.com` and `www.drquarrier.com`. TLS certificates issue automatically.
4. Add a redirect so `www` → apex (or apex → www, your choice) in Pages settings.

Optional later: transfer the registration from GoDaddy to Cloudflare Registrar for at-cost renewals. Not required.

---

## 4. After it's live — verify

- Visit `https://drquarrier.com` and click through all pages, the symptom-check tool, and the BPH 101 video on `/holep`.
- `https://drquarrier.com/robots.txt`, `/ai.txt`, `/sitemap.xml` all load.
- Google Rich Results Test (search.google.com/test/rich-results) on `/` and `/faq` — confirm Physician + FAQ results.
- Submit the site to **Google Search Console** (add property, verify via DNS TXT in Cloudflare, submit sitemap.xml).
- Work through `../AI-Discoverability/audit.md` — directory listings + Google Business Profile.

---

## Local preview (optional)

If you want to preview before pushing:

```bash
cd site
npm install      # one time; pause OneDrive sync first to avoid file locks
npm run dev       # http://localhost:4321
```

To rebuild content after editing the markdown in `../Content-Drafts/`:

```bash
node scripts/clean-content.mjs   # regenerates src/content/pages/*.md
```

---

## What's in the build

- 12 pages: landing, /holep (with embedded BPH 101 video), /why-holep, /early-intervention, /recovery, /symptom-check (IPSS tool), /research, /faq (FAQ rich-results markup), /fellowship, /already-in-retention, /traveling-to-urmc, /for-providers.
- Schema.org JSON-LD on every page (Physician + aggregateRating 4.7/703, MedicalBusiness, WebSite, per-page type); FAQPage markup on /faq.
- robots.txt + ai.txt (permissive AI crawlers), sitemap.xml.
- Photos in /photos. No tracking, no cookies, no PHI collected.

## Still to wire in

- **Google Scholar URL** — once provided, add to `src/consts.ts`, the `/research` page, and the `sameAs` array in `src/components/Schema.astro`.
- **Favicon** — currently a placeholder navy "Q" mark (`public/favicon.svg`); swap for a real mark if desired.
