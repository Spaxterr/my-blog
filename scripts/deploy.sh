#!/bin/bash
# Builds the images, creates any missing secrets and deploys the stack.
# With TAG set it skips the build and deploys that existing build (rollback).
set -euo pipefail
cd "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"

[ -f .env ] || { echo "No .env: run 'cp .env.example .env' and set DOMAIN_NAME" >&2; exit 1; }
set -a; . ./.env; set +a
: "${IMAGE_PREFIX:=my-blog}"

if [ -z "${TAG:-}" ]; then
  TAG=$(git rev-parse --short HEAD)
  for s in auth web blog-posts caddy; do
    docker build -f "apps/$s/Dockerfile" -t "$IMAGE_PREFIX/$s:$TAG" .
    if [ "${PUSH:-0}" = 1 ]; then docker push "$IMAGE_PREFIX/$s:$TAG"; fi
  done
fi
export TAG IMAGE_PREFIX

has_secret() { docker secret inspect "my-blog_$1" >/dev/null 2>&1; }
# Reads the value from stdin, so it never appears in argv or shell history.
create_secret() { docker secret create "my-blog_$1" - >/dev/null && echo "created secret my-blog_$1"; }

if ! has_secret postgres_password; then
  # Hex, not base64: / + = would break the connection URLs.
  pw=$(openssl rand -hex 32)
  printf '%s' "$pw" | create_secret postgres_password
  for s in auth_database_url blog_database_url; do
    printf 'postgres://postgres:%s@postgres:5432/my_blog' "$pw" | create_secret "$s"
  done
  unset pw
fi
if ! has_secret redis_acl; then
  pw=$(openssl rand -hex 32)
  printf 'user default on #%s ~* &* +@all\n' "$(printf '%s' "$pw" | sha256sum | cut -d' ' -f1)" |
    create_secret redis_acl
  printf 'redis://:%s@redis:6379' "$pw" | create_secret redis_url
  unset pw
fi
has_secret auth_secret ||openssl rand -hex 32 | create_secret auth_secret

for s in auth_github_client_id auth_github_client_secret auth_discord_client_id auth_discord_client_secret; do
  if ! has_secret "$s"; then
    read -rsp "Enter $s (input hidden): " value && echo
    printf '%s' "$value" | create_secret "$s"
  fi
done
unset value

docker stack deploy -c docker-stack.yml --resolve-image "${RESOLVE_IMAGE:-never}" my-blog
docker stack services my-blog
