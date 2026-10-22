#!/bin/bash
set -euo pipefail
. "$(dirname "$0")/env.sh"
load_env

# blog-posts migrates itself on boot (sqlx::migrate! in main.rs) — only auth needs this.
docker service create --name migrate-auth --no-resolve-image \
  --restart-condition on-failure --restart-max-attempts 10 --restart-delay 5s \
  --network my-blog_default \
  --secret source=my-blog_auth_database_url,target=database_url \
  --secret source=my-blog_auth_redis_url,target=redis_url \
  --secret source=my-blog_auth_discord_client_id,target=discord_client_id \
  --secret source=my-blog_auth_discord_client_secret,target=discord_client_secret \
  --secret source=my-blog_auth_github_client_id,target=github_client_id \
  --secret source=my-blog_auth_github_client_secret,target=github_client_secret \
  --secret source=my-blog_auth_secret,target=secret \
  "$IMAGE_PREFIX/auth:$TAG" node dist/migrate.js

docker service logs -f migrate-auth
