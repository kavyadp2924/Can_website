# Deployment — Hostinger VPS

The site stays a static export (`next build` → `out/`, `output: 'export'` in
`next.config.ts`). Nothing runs server-side; Nginx just serves files. This is
what makes the KVM 2 VPS (2 vCPU / 8GB) comfortable at 1000-3000 users without
any application server to fall over.

## One-time VPS setup

1. `apt install nginx certbot python3-certbot-nginx`
2. `mkdir -p /var/www/canorous.com/out` and `chown` it to the deploy user.
3. Copy `deploy/nginx.conf` to `/etc/nginx/sites-available/canorous.com`,
   symlink into `sites-enabled`, `nginx -t`, `systemctl reload nginx`.
4. Point DNS at the VPS IP (A record for `canorous.com` and `www`).
5. `certbot --nginx -d canorous.com -d www.canorous.com` — issues TLS and
   rewrites the Nginx config's `listen`/`ssl_certificate` lines in place.
6. Create a deploy-only SSH keypair (`ssh-keygen -t ed25519 -f deploy_key`),
   add the public half to the deploy user's `~/.ssh/authorized_keys` on the
   VPS, keep the private half for the GitHub secret below.
7. Recommended: put the VPS behind **Cloudflare** (free plan) — point the
   domain's nameservers at Cloudflare, proxy the A record. This adds a CDN
   layer in front of the VPS and absorbs traffic spikes before they reach it.

## GitHub repo configuration

`.github/workflows/deploy.yml` builds on every push to `main` and rsyncs
`out/` to the VPS. It needs, under repo **Settings → Secrets and variables →
Actions**:

**Secrets** (sensitive):
- `VPS_HOST` — VPS IP or hostname
- `VPS_USER` — deploy SSH user
- `VPS_SSH_KEY` — the private half of the deploy keypair from step 6 above
- `VPS_PATH` — `/var/www/canorous.com/out/`
- `NEXT_PUBLIC_WEB3FORMS_KEY` — from https://web3forms.com

**Variables** (not secret, just build-time config):
- `NEXT_PUBLIC_SITE_URL` — `https://canorous.com`
- `NEXT_PUBLIC_GA_ID` — GA4 measurement ID, e.g. `G-XXXXXXXXXX` (optional —
  leave the variable unset and the site ships with no analytics script at all)

## Load headroom check

Once live, before calling it done for 1000-3000 users: `curl -I` a few pages
to confirm the cache headers in `deploy/nginx.conf` are actually being sent,
run an SSL Labs check, and point `autocannon`/`k6` at the homepage and a
gallery page for a minute at a few hundred concurrent connections. A static
Nginx site on 2 vCPUs handles this without effort — this step is just to
prove it rather than assume it.

## Still needed from you before this can actually deploy

- VPS IP/hostname and a deploy SSH user
- The real domain's DNS access (to point it at the VPS, or at Cloudflare)
- A Web3Forms access key (free, instant — https://web3forms.com)
- A GA4 measurement ID, if you want analytics (optional)
