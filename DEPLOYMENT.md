# Deployment

Docker Swarm, one stack named `my-blog`: `web`, `auth`, `blog-posts`, `postgres`,
`redis`. Credentials come from Docker secrets, hostnames from `.env` at the
project root. Images are environment-agnostic — the same build runs anywhere.

## 1. Prerequisites

On the target machine (your laptop works — "locally" and "on a server" are the
same steps):

```bash
docker swarm init
```

Everything below runs from a git checkout on that machine. Docker needs
BuildKit, which is the default.

## 2. Configure

```bash
cp .env.example .env
$EDITOR .env
```

| Variable | Default | Effect |
|---|---|---|
| `AUTH_ORIGIN` | *required* | Public auth URL. Must resolve from a browser **and** from inside the `web` container. |
| `WEB_ORIGIN` | *required* | Public web URL. Becomes `auth`'s CORS allowlist. |
| `WEB_PORT` | `80` | Published port for `web`. |
| `AUTH_PORT` | `3001` | Published port for `auth`. |
| `IMAGE_PREFIX` | `my-blog` | Registry path for multi-node; leave as-is for one node. |
| `RESOLVE_IMAGE` | `never` | Set to `always` when using a registry. |
| `PUSH` | `0` | `1` pushes images after building. |
| `REPLICAS` | `2` | All three app services. |
| `LOG_LEVEL` | `info` | `auth` log level. |
| `TAG` | commit SHA | Image tag. Set to deploy or roll back a specific build. |

For a local deploy:

```
AUTH_ORIGIN=http://localhost:3001
WEB_ORIGIN=http://localhost:8080
WEB_PORT=8080
```

`.env` is gitignored and holds no credentials. A missing `AUTH_ORIGIN` or
`WEB_ORIGIN` aborts the deploy naming the variable.

## 3. Create secrets

All nine are required and must exist before deploying. Create them without the
value touching shell history or disk — pick whichever case fits.

**Generated values** (`postgres_password`, `auth_secret`) — pipe the generator
straight in, so the value is never displayed, stored, or typed:

```bash
openssl rand -base64 32 | docker secret create auth_secret -
```

**Values you have to paste** (OAuth client secrets) — `read -s` keeps it off the
screen, and the command line contains only the variable name:

```bash
read -rs 'SECRET?Value: ' && printf '%s' "$SECRET" | \
  docker secret create auth_github_client_secret - && unset SECRET
```

**Values already in a file** — pass the path, then remove the file:

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

- `docker secret create name <<< "$SECRET"` — zsh backs a herestring with a
  temp file in `/tmp`, so the value hits disk. A pipe does not.
- Putting the literal in the command (`printf '%s' 'hunter2' | ...`) — that is
  exactly what lands in `~/.zsh_history`.
- Piping with a non-builtin (`/bin/echo`) — the value shows up in `ps` and
  `/proc/<pid>/cmdline`. `printf` and `echo` are zsh builtins, so the forms
  above are safe.

Once created, a secret's value cannot be read back — `docker secret inspect`
returns only metadata.

| Secret | Value |
|---|---|
| `postgres_password` | Postgres superuser password |
| `auth_database_url` | `postgres://postgres:<password>@postgres:5432/my_blog` |
| `blog_database_url` | same URL as above |
| `auth_redis_url` | `redis://redis:6379` |
| `auth_secret` | 32+ random bytes — generate as shown above |
| `auth_discord_client_id` | Discord OAuth app |
| `auth_discord_client_secret` | Discord OAuth app |
| `auth_github_client_id` | GitHub OAuth app |
| `auth_github_client_secret` | GitHub OAuth app |

Set the OAuth apps' callback URLs to `$AUTH_ORIGIN/api/auth/callback/<provider>`.

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

Commit first — images are tagged with the current commit SHA, so uncommitted
changes get built under the previous commit's tag.

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

Updates use `start-first`: the new task must be running before the old one is
killed, so both versions serve briefly. Keep migrations backwards-compatible
with the previous image for one deploy.

## 6. Verify

```bash
docker stack services my-blog                 # all replicas n/n
docker service ps my-blog_web --no-trunc      # failure reasons if not
docker service logs -f my-blog_auth
curl -f $WEB_ORIGIN
curl -f $AUTH_ORIGIN/api/auth/ok
```

No service declares a healthcheck, so `n/n` means the process started, not that
it works. Open the site in a browser and check the console — all auth calls are
browser-side.

To see which auth origin a running `web` hands to browsers:

```bash
curl -s $WEB_ORIGIN | grep -o 'auth-host" content="[^"]*"'
```

## 7. Rollback

```bash
docker service rollback my-blog_web    # one service
TAG=<previous-sha> ./scripts/02-deploy.sh    # whole stack
```

Migrations are forward-only; rollback does not undo them.

## Multi-node

The default config only works on a single node — workers cannot see the
manager's local images. For more than one node, set `IMAGE_PREFIX` to a registry
path, `PUSH=1`, and `RESOLVE_IMAGE=always`.

`postgres` and `redis` are pinned to the manager because `pgdata` is a
node-local volume. There is no replication and no backups — losing that node
loses the database.

## Known issues

- **`web` returns 500 on every page if `auth` is unreachable.** The
  `routes/layout.tsx` loader calls `getSession()` with no error handling and
  wraps every route, so an auth outage is a full site outage. Fix: try/catch
  returning `null`.
- **No healthchecks**, so `start-first` can promote a task that cannot serve.
- **`blog-posts` requires `AUTH_HOST` but never reads it** (`main.rs:20`). It is
  set in the stack only because the service panics without it.
- **`web` calls `AUTH_ORIGIN` during SSR**, so that hostname must be reachable
  from inside the container, TLS included — not just from browsers. This is
  deliberate: better-auth needs the browser-facing origin for valid cookies.
- Serve both origins over TLS in production. Cross-origin auth cookies over
  plain HTTP will not survive a real browser.
