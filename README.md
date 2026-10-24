# Pavernor — pavernor.tech

Company site for Pavernor, an agentic AI consultancy. Next.js (App Router) +
Tailwind v4 + GSAP ScrollTrigger + three.js. Content for the blog lives in
`content/blog/*.md`.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
```

## Production topology (verified 2026-10-24)

```
browser → Cloudflare edge (TLS)
        → tunnel `pavernor` (7afc71db-1ab6-4f03-b5a2-04de9d6ac679)
        → http://127.0.0.1:80 (Traefik — satu-satunya ingress)
        → container `pavernor-web`  :3000  (pavernor.tech, www.pavernor.tech)
        → container `notemae-fe`    :4173  (notemae.pavernor.tech)
        → container `notemae-api`   :8000  (notemae-api.pavernor.tech)
```

| Item | Value |
| --- | --- |
| VPS | `vps-alvn` — 43.228.214.64 (`mail.pavernor.tech`), Ubuntu 26.04 |
| App dir | `~/Project/pavernor-src` (compose + Dockerfile, container `pavernor-web`) |
| Ingress | `~/Project/Cloudflared/traefik/docker-compose.yml` — Traefik v3.7.16, bind `127.0.0.1:80` |
| Tunnel config | `~/.cloudflared/config.yml` — `pavernor.tech` + `*.pavernor.tech` → `127.0.0.1:80` |
| Tunnel service | `systemctl --user status cloudflared-pavernor` |
| DNS | apex + wildcard CNAME → `7afc71db…cfargotunnel.com` (proxied); `mail` A record unproxied |
| Notemae | `~/Project/Notemae` — label Traefik di `docker-compose.override.yml` |

Subdomain baru cukup menambah label Docker:

```yaml
labels:
  - traefik.enable=true
  - traefik.docker.network=traefik
  - traefik.http.routers.app.rule=Host(`app.pavernor.tech`)
  - traefik.http.routers.app.entrypoints=web
  - traefik.http.services.app.loadbalancer.server.port=3000
```

`pavernor.site` sudah diistirahatkan: DNS web-nya dihapus, hanya email
(`alvin@pavernor.site`) yang masih aktif.

## Deploy

```bash
./scripts/deploy.sh          # build → snapshot → rsync → compose up → health check
```

Rollback ke image sebelumnya:

```bash
ssh vps-alvn 'cd ~/Project/pavernor-src && docker tag pavernor-web:rollback-<stamp> pavernor-web:latest && docker compose up -d --no-build'
```

## Writing a post

Create `content/blog/<slug>.md`:

```markdown
---
title: "Title"
date: "2026-10-24"
category: "News"        # free-form: News / Ideas / Notes / Engineering
excerpt: "One or two sentences used in the list and in og:description."
author: "Alvin"
cover: "/images/your-cover.webp"   # optional, put the file in public/images
---

Markdown body.
```

`/blog`, `/blog/<slug>`, `/feed.xml`, and `/sitemap.xml` regenerate at build
time, so a deploy is all that is needed after adding a file.
