# Pavernor — pavernor.tech

Company site for Pavernor, an agentic AI consultancy. Next.js (App Router) +
Tailwind v4 + GSAP ScrollTrigger + three.js. Blog content lives in
`content/blog/*.md`.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint
```

## Environment

Copy the template and fill it in:

```bash
cp .env.example .env
```

Three groups of variables:

| Group | Used by |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | deployment automation |
| `SMTP_*` | transactional email via the Brevo relay |
| `SMTP_REPLY_TO` | optional; where replies should land |

`lib/env.ts` reads these lazily, so `next build` works without credentials.
`lib/mail.ts` is server-only — never import it from a client component.

Test the SMTP configuration without sending anything:

```bash
npm run mail:test
```

## Deploy

The site runs as a container behind Cloudflare. `scripts/deploy.sh` syncs the
working tree over SSH, rebuilds the image, restarts the container, and runs a
health check.

```bash
HOST=<your-ssh-alias> ./scripts/deploy.sh
```

Connection details are intentionally not stored here; set `HOST` in your shell
or in a local, untracked file.

Roll back to the previous image by re-tagging the snapshot the script created.

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

`/blog`, `/blog/<slug>`, `/feed.xml`, and `/sitemap.xml` are generated at build
time, so a deploy is all that is needed after adding a file.

## Layout

```
app/          routes, feed, sitemap, robots
components/   section components and GSAP-driven interactions
content/blog  markdown posts
lib/          blog parsing, env loader, mail transport
public/images artwork used by the page and the posts
scripts/      deploy and mail diagnostics
```

## Licence

MIT. See [LICENSE](LICENSE).
