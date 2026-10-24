#!/usr/bin/env bash
# Deploy pavernor.tech ke VPS `vps-alvn` (43.228.214.64).
#
# Topologi (terverifikasi 2026-10-24):
#   browser → Cloudflare edge → tunnel `pavernor` (7afc71db) →
#   127.0.0.1:80 (Traefik) → container `pavernor-web` :3000
#
# Traefik adalah satu-satunya ingress; subdomain lain (notemae.pavernor.tech,
# notemae-api.pavernor.tech) didaftarkan lewat label Docker di compose-nya
# masing-masing. Jangan arahkan tunnel ke port aplikasi langsung.
#
# Rollback:
#   ssh vps-alvn 'cd ~/Project/pavernor-src && docker tag pavernor-web:rollback-<stamp> pavernor-web:latest && docker compose up -d --no-build'
set -euo pipefail

HOST="${HOST:-vps-alvn}"
DIR="Project/pavernor-src"
STAMP="$(date +%Y%m%d-%H%M%S)"
cd "$(dirname "$0")/.."

echo "› snapshot image + source di $HOST ($STAMP)"
ssh "$HOST" "docker tag pavernor-web:latest pavernor-web:rollback-$STAMP 2>/dev/null || true; \
  mkdir -p ~/pavernor-backups && tar -C ~/Project -czf ~/pavernor-backups/$STAMP.tgz pavernor-src --exclude=node_modules --exclude=.next 2>/dev/null || true; \
  ls -t ~/pavernor-backups/*.tgz 2>/dev/null | tail -n +6 | xargs -r rm -f"

echo "› sync source"
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .design --exclude .git \
  --exclude '.env*' --exclude '*.tsbuildinfo' --exclude AGENTS.md --exclude next-env.d.ts \
  ./ "$HOST:$DIR/"

echo "› build + restart container"
ssh "$HOST" "cd ~/$DIR && docker compose up -d --build"

echo "› health check"
code=000
for _ in $(seq 1 30); do
  code=$(ssh "$HOST" 'curl -s -o /dev/null -w "%{http_code}" -H "Host: pavernor.tech" http://127.0.0.1:80/')
  [ "$code" = 200 ] && break
  sleep 2
done
echo "traefik $code"
[ "$code" = 200 ]

for path in / /blog /feed.xml /sitemap.xml /robots.txt; do
  printf "public %s %s\n" "$(curl -s -o /dev/null -w '%{http_code}' "https://pavernor.tech$path")" "$path"
done

ssh "$HOST" "docker image prune -f >/dev/null 2>&1 || true"
echo "✓ deployed ($STAMP) → https://pavernor.tech"
