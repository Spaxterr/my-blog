# Deployment

The app runs as a Docker Swarm stack on one machine. One script builds, creates
secrets, and deploys:

```bash
./scripts/deploy.sh
```

## First deploy

Run these on the server, from a git checkout of this repo.

**1. Point your domain at the server in Cloudflare.**

- Under **DNS**, add an `A` record for your domain with the server's public IP,
  and leave **Proxied** on (orange cloud).
- Under **SSL/TLS**, set the encryption mode to **Full (strict)**. Caddy gets
  a real Let's Encrypt certificate, so Cloudflare can verify it.
- Open ports 80 and 443 (TCP and UDP) on the server.

**2. Turn on Swarm** (only once per machine):

```bash
docker swarm init
```

**3. Create the OAuth apps** on [GitHub](https://github.com/settings/developers)
and [Discord](https://discord.com/developers/applications). Set the callback URLs
to these exact values, replacing `example.com` with your domain:

```
https://example.com/api/auth/callback/github
https://example.com/api/auth/callback/discord
```

Keep the client IDs and secrets at hand for step 5.

**4. Configure:**

```bash
cp .env.example .env
$EDITOR .env        # set DOMAIN_NAME and ACME_EMAIL
```

**5. Deploy:**

```bash
./scripts/deploy.sh
```

The first run asks for the four OAuth values. Input is hidden and the values
never touch disk or shell history. The script generates the database and Redis
passwords and the auth signing secret itself.

Postgres needs a few seconds to start, so `auth` may restart a couple of times
first. That's normal. Then [check it works](#check-it-works).

## Deploy an update

```bash
git pull
./scripts/deploy.sh
```

`web`, `auth` and `blog-posts` are replaced one task at a time, and each new
task starts before the old one stops. Caddy restarts once, which drops requests
for a second or two. Database migrations run automatically
when `auth` and `blog-posts` start. While the update rolls out, old and new
versions run together, so a migration must still work with the previous
version.

## Roll back

Images are tagged with the commit SHA they were built from. Setting `TAG`
deploys an existing build without rebuilding:

```bash
docker image ls my-blog/web          # list the available tags
TAG=abc1234 ./scripts/deploy.sh
```

## Check it works

```bash
docker stack services my-blog        # every REPLICAS column should read n/n
```

```bash
set -a; . ./.env; set +a             # loads $DOMAIN_NAME into the shell
curl -f https://$DOMAIN_NAME                    # the site
curl -f https://$DOMAIN_NAME/api/auth/ok        # {"ok":true}
curl -f https://$DOMAIN_NAME/api/blog/posts     # the posts as JSON
```

Then open the site in a browser and sign in. No service has a healthcheck, so
`n/n` only means the processes started. The browser test is the real check.

## Troubleshooting

| Symptom | Check |
|---|---|
| A service is stuck at `0/n` | `docker service ps my-blog_<service> --no-trunc` shows why tasks fail. `docker service logs my-blog_<service>` shows the app's logs. |
| Cloudflare shows error 521, 522 or 525 | It can't reach Caddy over HTTPS. Check `docker service logs my-blog_caddy` and that ports 80/443 are open. |
| Cloudflare shows error 526, or Caddy logs certificate errors | Caddy has no certificate yet. If issuance keeps failing, switch the DNS record to **DNS only** (grey cloud) until Caddy logs `certificate obtained successfully`, then turn the proxy back on. |
| Login fails at GitHub or Discord | The callback URL doesn't match. See the command below. |
| Everyone is logged out after sign-in | `auth` must be served from the same domain as the site. Don't move it to a subdomain. |
| `secret not found: my-blog_...` | A secret was deleted by hand. See [Change a secret](#change-a-secret). |
| `auth` keeps failing with a password error | The `pgdata` volume was made with an older password. Restore the old secrets, or delete the volume to start fresh (**this deletes all data**). |

To see the callback URL `auth` actually sends to GitHub:

```bash
curl -s -o /dev/null -D- -X POST https://$DOMAIN_NAME/api/auth/sign-in/social \
  -H 'Content-Type: application/json' -d '{"provider":"github","callbackURL":"/"}' \
  | grep -io 'redirect_uri=[^&]*'
```

## Change a secret

Secrets can't be read back or edited. To change one, remove it and let the
script create it again. A service that uses a secret has to be stopped before
the secret can be removed, so take the whole stack down first:

```bash
docker stack rm my-blog              # wait ~10s for the containers to stop
docker secret rm my-blog_auth_github_client_secret
./scripts/deploy.sh                   # asks for the new value
```

All secrets have a `my-blog_` prefix:

| Secret | Created by |
|---|---|
| `postgres_password`, `auth_database_url`, `blog_database_url` | Generated together. Only change them along with the `pgdata` volume, since Postgres keeps the password from the first start. |
| `redis_acl`, `redis_url` | Generated together. `redis_acl` holds only a hash of the password; `redis_url` has the password itself, for `auth`. Remove both to change it. |
| `auth_secret` | Generated. Changing it logs everyone out. |
| `auth_github_client_id`, `auth_github_client_secret` | You, when prompted |
| `auth_discord_client_id`, `auth_discord_client_secret` | You, when prompted |

## Settings

All of these go in `.env`:

| Variable | Default | What it does |
|---|---|---|
| `DOMAIN_NAME` | *required* | The site's domain. All public URLs come from it. |
| `ACME_EMAIL` | `admin@example.com` | Let's Encrypt sends certificate expiry warnings here. |
| `REPLICAS` | `2` | Copies of `web`, `auth` and `blog-posts`. |
| `LOG_LEVEL` | `info` | Log level for `auth`. |
| `TAG` | current commit | Set it to deploy an existing build. See [Roll back](#roll-back). |
| `IMAGE_PREFIX` | `my-blog` | Image name prefix. Change it only for a registry. |
| `PUSH` | `0` | `1` pushes images to the registry after building. |
| `RESOLVE_IMAGE` | `never` | `always` when nodes pull images from a registry. |

Leave the last three alone on a single server.

## Running locally

Set `DOMAIN_NAME=localhost` and deploy as usual. Caddy signs `localhost` with
its own certificate authority instead of Let's Encrypt, so:

`curl` needs `-k`, and browsers show a warning. To trust it, copy
`/data/caddy/pki/authorities/local/root.crt` out of the Caddy container and
install it.

## How it fits together

Everything is served from one domain, with Caddy routing by path:

| Path | Service |
|---|---|
| `/api/auth/*` | `auth` (sign-in, sessions) |
| `/api/blog/*` | `blog-posts`. Caddy strips the prefix, so the service sees `/posts`. |
| everything else | `web` (the site) |

`auth` must be on the same domain as the site because its session cookie is
host-only. On a subdomain the browser would never send the cookie to the site,
and `web`, which reads the session server-side, would see every user as logged
out.

Server-side, `web` calls `auth` and `blog-posts` directly over the internal
network (`http://auth:3001`, `http://blog-posts:3000`) instead of going back out
through Caddy. Browsers get the public URL.

Postgres, Redis and Caddy run on the manager node. Postgres and Caddy keep
their data in the `pgdata`, `caddy_data` and `caddy_config` volumes. Redis
requires a password and has no volume; it only holds sessions, so replacing
it logs everyone out.

**Visitor IPs.** All traffic arrives through Cloudflare. Caddy's ports use
`mode: host`, so Caddy sees the connecting Cloudflare address instead of
Swarm's routing mesh. For requests from Cloudflare's IP ranges, Caddy takes
the visitor's IP from `CF-Connecting-IP`. The ranges are downloaded when the
Caddy image is built, so every deploy refreshes them. Rate limiting and
Caddy's logs use that IP, and Caddy passes it to `auth` as `X-Real-IP`, which
is the only header `auth` trusts for it.

## Upgrading from the old numbered scripts

`scripts/01-03` and the separate `migrate-auth` job are gone. `auth` now migrates
itself on startup, and Redis now requires a password, with its URL in the new
`my-blog_redis_url` secret. After the first deploy with the new script, remove
what's left over:

```bash
docker service rm migrate-auth 2>/dev/null
docker secret rm my-blog_auth_redis_url
```
