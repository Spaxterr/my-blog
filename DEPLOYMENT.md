# Deployment

Everything is served from one origin — `$DOMAIN_NAME`. There are no subdomains.

| Path                      | Service                                                |
| ------------------------- | ------------------------------------------------------ |
| `/api/auth/*`             | `auth`                                                 |
| `/api/blog/*`             | `blog-posts` (reads public, `POST /posts` admin-gated) |
| everything else           | `web`                                                  |

`auth` has to share the web origin: its session cookie is host-only, so on an
`auth.$DOMAIN_NAME` the browser would never send it to `$DOMAIN_NAME` — and `web`
reads the session server-side, from the cookie header of the incoming request. On
a separate host every `routeLoader$` and `routeAction$` sees a logged-out user no
matter who is signed in.

`blog-posts` is there for consistency rather than necessity — `web` only ever
calls it server-side over the overlay network, so the public mount exists for
`/api/blog/docs` and any external consumer. Caddy strips the `/api/blog` prefix,
so the service still serves `/posts` and `/openapi.json` at its own root.

## 1. Prerequisites

```bash
docker swarm init
```

Point `$DOMAIN_NAME` at the machine's public IP before deploying.

Everything below runs from a git checkout on that machine. Docker needs
BuildKit, which is the default.

## 2. Configure

```bash
cp .env.example .env
$EDITOR .env
```

| Variable | Default | Effect |
|---|---|---|
| `DOMAIN_NAME` | *required* | Apex domain. Every public origin is derived from it — `https://$DOMAIN_NAME` becomes `auth`'s own base URL, its trusted origin, and the OAuth redirect base. |
| `ACME_EMAIL` | `admin@example.com` | Contact for the certificate authority; gets expiry warnings. |
| `IMAGE_PREFIX` | `my-blog` | Registry path for multi-node; leave as-is for one node. |
| `RESOLVE_IMAGE` | `never` | Set to `always` when using a registry. |
| `PUSH` | `0` | `1` pushes images after building. |
| `REPLICAS` | `2` | All three app services. |
| `LOG_LEVEL` | `info` | `auth` log level. |
| `TAG` | commit SHA | Image tag. Set to deploy or roll back a specific build. |

For a local deploy, `DOMAIN_NAME=localhost`. Caddy signs `*.localhost` with its
own CA instead of calling Let's Encrypt, so it works offline; browsers and `curl`
will not trust that CA until you install it (`docker cp` it out of
`/data/caddy/pki/authorities/local/root.crt`), so until then use `curl -k`.

**Swarm's published ports are IPv4-only.** If `getent hosts localhost`
returns only `::1`, every request hangs; add `127.0.0.1 localhost` to
`/etc/hosts`.

`.env` is gitignored and holds no credentials. A missing `DOMAIN_NAME` aborts the
deploy naming the variable.

The public origin is only half the picture: the `web` container also renders
server-side, and going back out through Caddy to reach a service on its own
overlay network is a pointless round trip. So SSR uses `AUTH_INTERNAL_HOST`
(`http://auth:3001`, a literal in `docker-stack.yml`) while the browser gets
`AUTH_HOST` from a `<meta name="auth-host">` tag. Same for `BLOG_POSTS_HOST`.
Internal names never vary between environments, so they are not knobs.

## 3. Create secrets

All nine are required and must exist before deploying. It is important to create them without the value being saved in shell history.

**Generated values** (`postgres_password`, `auth_secret`) - pipe the generator
straight in, so the value is never displayed, stored, or typed:

```bash
openssl rand -base64 32 | docker secret create auth_secret -
```

OAuth client secrets: `read -s` keeps it off the
screen, and the command line contains only the variable name:

```bash
read -rs 'SECRET?Value: ' && printf '%s' "$SECRET" | \
  docker secret create auth_github_client_secret - && unset SECRET
```

**Values already in a file**: pass the path, then remove the file:

```bash
docker secret create auth_github_client_secret ./secret.txt && shred -u ./secret.txt
```

Composing a value from another, without either appearing in history:

```bash
read -rs 'PGPW?Postgres password: '
printf '%s' "$PGPW" | docker secret create postgres_password -
printf 'postgres://postgres:%s@postgres:5432/my_blog' "$PGPW" |
  docker secret create auth_database_url -
printf 'postgres://postgres:%s@postgres:5432/my_blog' "$PGPW" |
  docker secret create blog_database_url -
unset PGPW
```

Three things to avoid:

- `docker secret create name <<< "$SECRET"`: bash backs a herestring with a
  temp file in `/tmp`, so the value hits disk. A pipe does not.
- Putting the literal in the command (`printf '%s' 'hunter2' | ...`): Lands in `~/.bash_history`.
- Piping with a non-builtin (`/bin/echo`): the value shows up in `ps` and
  `/proc/<pid>/cmdline`. `printf` and `echo` are bash builtins, so the forms
  above are safe.

Once created, a secret's value cannot be read back: `docker secret inspect`
returns only metadata.

| Secret                       | Value                                                  |
| ---------------------------- | ------------------------------------------------------ |
| `postgres_password`          | Postgres superuser password                            |
| `auth_database_url`          | `postgres://postgres:<password>@postgres:5432/my_blog` |
| `blog_database_url`          | same URL as above                                      |
| `auth_redis_url`             | `redis://redis:6379`                                   |
| `auth_secret`                | 32+ random characters                                  |
| `auth_discord_client_id`     | Discord OAuth app                                      |
| `auth_discord_client_secret` | Discord OAuth app                                      |
| `auth_github_client_id`      | GitHub OAuth app                                       |
| `auth_github_client_secret`  | GitHub OAuth app                                       |

Set the OAuth apps' callback URLs to
`https://$DOMAIN_NAME/api/auth/callback/<provider>`. They must match exactly or
login fails at the provider. Confirm what `auth` actually sends:

```bash
curl -s -o /dev/null -D- -X POST https://$DOMAIN_NAME/api/auth/sign-in/social \
  -H 'Content-Type: application/json' -d '{"provider":"github","callbackURL":"/"}' \
  | grep -i '^location' | grep -o 'redirect_uri=[^&]*'
```

The `my_blog` database is created by `POSTGRES_DB` on first startup only. If the
`pgdata` volume already exists, create it by hand:
`docker exec -it $(docker ps -qf name=my-blog_postgres) createdb -U postgres my_blog`.

Secrets are immutable. To change one, create it under a new name and
`docker service update --secret-rm old --secret-add source=new,target=<target>`.
Rotating `auth_secret` logs everyone out.

## 4. Build

```bash
./scripts/01-docker-build.sh
```

## 5. Deploy and migrate

`auth` needs its schema created by a one-off job, and that job needs Postgres
running. On a **first** deploy, that means deploying before migrating:

```bash
./scripts/02-deploy.sh     # auth crash-loops until the next step finishes
./scripts/03-migrate.sh    # follows the job's logs; Ctrl-C when it succeeds
docker service rm migrate-auth
```

On **later** deploys, migrate first:

```bash
./scripts/03-migrate.sh && docker service rm migrate-auth
./scripts/02-deploy.sh
```

`blog-posts` migrates itself on startup, so it needs nothing here.

The job runs `node dist/migrate.js`, which calls better-auth's `getMigrations()`
from the copy already in the image. It does not install anything at runtime, so
it works offline and cannot drift.

After `auth`'s schema is created for the first time, restart it so it stops
reporting a schema mismatch:

```bash
docker service update --force my-blog_auth
```

Updates use `start-first`: the new task must be running before the old one is
killed, so both versions serve briefly. Keep migrations backwards-compatible
with the previous image for one deploy.

## 6. Verify

The commands below use `$DOMAIN_NAME`, so load `.env` first.

```bash
set -a; . ./.env; set +a
```

```bash
docker stack services my-blog                 # all replicas n/n
docker service ps my-blog_web --no-trunc      # failure reasons if not
docker service logs -f my-blog_auth
docker service logs -f my-blog_caddy            # certificate issuance and failures
curl -f https://$DOMAIN_NAME
curl -f https://$DOMAIN_NAME/api/auth/ok                    # {"ok":true}
curl -s https://$DOMAIN_NAME/api/auth/get-session           # null when logged out
curl -f https://$DOMAIN_NAME/api/blog/posts                 # exercises blog-posts
curl -sI https://$DOMAIN_NAME/build/ | grep -i cache-control   # immutable
```

Add `-k` on a local deploy until you trust Caddy's CA — without it a request
fails on certificate verification, which looks the same as the service being
down.

Confirm the auth tables exist:

```bash
docker exec $(docker ps -qf name=my-blog_postgres) \
  psql -U postgres -d my_blog -tAc \
  "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;"
```

Expect `account`, `blog_posts`, `user`, `_sqlx_migrations`. Sessions live in
Redis, so there is no `session` table.

No service declares a healthcheck, so `n/n` means the process started, not that
it works. Open the site in a browser and check the console.

To see which auth origin a running `web` hands to browsers:

```bash
curl -s https://$DOMAIN_NAME | grep -o 'auth-host" content="[^"]*"'
```

## Known issues

- **Swarm's routing mesh hides the client IP** from Caddy, so its access logs
  show overlay addresses. Needs `mode: host` on the published ports to fix, which
  pins the proxy to one node.
