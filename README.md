# Canorous Technology — Public Website

Static marketing site. Next.js 15, exported to plain HTML, hosted on Firebase.

**In this repo, but not part of its workspace.** The root `package.json` only
claims `apps/*` and `packages/*`, so this folder keeps its own `node_modules`,
its own `npm install` and its own deploy. Turbo does not see it either — running
`npm run dev` at the repo root will not start this site.

That is deliberate: it has no database, no server and no authentication, it ships
to a different host, and nothing about it can take the employee portal down — or
the reverse.

| | |
|---|---|
| Source | `S:\canorous technology\website\public-site` |
| Output | `out/` — plain HTML, CSS and JS |
| Host | Firebase Hosting |
| Portal / API | `apps/` and `packages/` in this same repo (separate project, Google Cloud) |

---

## Running it

```bash
cd public-site     # its own project — do not run this from the repo root
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # writes ./out
npm run preview    # serve the real export at http://localhost:5000
```

`npm run preview` is worth using before any deploy — `dev` runs a server, and
this site will not have one in production. Some mistakes only appear once the
export is served as flat files.

---

## What static export means here

`output: 'export'` produces HTML with no Node process at runtime. That rules out:

- Server Actions, Route Handlers and server-side data fetching
- middleware
- `next/image` optimisation (`unoptimized: true` is set; source images are
  pre-compressed to WebP instead)
- any route not knowable at build time

The tradeoff is worth it: the site is a folder of files on a CDN. Nothing to
patch, nothing to restart, and it cannot be knocked over by traffic.

**Environment variables are baked in at build time.** A static site has no
runtime environment, so `NEXT_PUBLIC_API_URL` must be set before `next build`,
not on the host. Change it and you must rebuild.

---

## The contact form

The only piece that talks to a server. It posts from the browser to the portal
API on a different origin, which sends the mail through MilesWeb.

Two things must be true on the API side before it works:

1. **CORS** — `CORS_ORIGINS` must include this site's origin
   (`https://canorous.com`).
2. **A public endpoint** — `POST /api/contact`, reachable without a token, with
   its own rate limit. It is open to the internet, so validation and throttling
   must live there. The honeypot and timing check in the form cut obvious bot
   traffic and nothing more; anyone can call the endpoint directly.

**This endpoint does not exist yet.** The form is built and will submit; it will
report a failure until the API side is added.

---

## Deploying

```bash
npm install -g firebase-tools
firebase login
```

Set the project id in `.firebaserc` (currently `canorous-website`), then:

```bash
npm run deploy       # build + firebase deploy --only hosting
```

`firebase.json` already handles:

- **Caching** — hashed assets immutable for a year, HTML always revalidated so a
  deploy is visible immediately rather than whenever caches expire
- **Security headers** — nosniff, frame options, referrer policy, HSTS
- **301 redirects** from the old PHP URLs (`/about.php`, `/AITraining.php`,
  `/portfolio.php` and the rest), so existing links and search rankings survive
  the move

One setting worth not changing: `cleanUrls` is **off**, because
`trailingSlash: true` in `next.config.ts` already produces directories with an
`index.html`. Turning both on makes Firebase strip the slash while Next adds it
back — a redirect loop.

---

## Structure

```
src/
├─ app/
│  ├─ page.tsx                 home
│  ├─ solutions/               + engineering, real-time-3d, immersive-architecture
│  ├─ products/                + presentation
│  ├─ canorous-edge/           AI training programme
│  ├─ about/  work/  contact/  privacy/
│  └─ globals.css              CTPL design tokens
├─ components/
│  ├─ site-header.tsx          dropdown nav, keyboard accessible
│  ├─ hero.tsx + hero-scene.tsx  3D hero, lazily loaded
│  ├─ motion.tsx               reveal, parallax, count-up, tilt
│  └─ ui.tsx                   shared page furniture
└─ lib/nav.ts                  navigation, one definition
```

The design system is deliberately **self-contained** rather than imported from
the portal monorepo — a marketing site should not need the portal checked out in
order to build.

---

## Brand

CTPL Light / Tech Direction v2.0, in `src/app/globals.css`. Two measured
corrections to the source palette:

| Source | Measured | Correction |
|---|---|---|
| Circuit Blue `#3D6BFF` on white | 4.42:1 — fails AA for body text | Kept for buttons, large headings and fills (3:1 needed). Body links use `#1A3FA8` at 8.6:1 |
| Slate Gray `#8a8a9a` on white | 3.40:1 — fails AA for body text | Kept for large labels. Muted body copy uses `#6d6d80` at 5.06:1 |

Signal Red `#D71E1E` measures 5.13:1 and passes as-is. Fonts are self-hosted by
`next/font`, so there is no third-party origin to allow.

---

## Still to do

- [ ] `POST /api/contact` on the portal API, plus this origin in `CORS_ORIGINS`
- [ ] Privacy policy text — a legal commitment, deliberately not inherited from
      the old site since this one collects data differently
- [ ] Replace the Work page imagery with project photography; the current images
      are carried over from the old site
- [ ] Real address and phone number on the Contact page
- [ ] Firebase project id in `.firebaserc`
