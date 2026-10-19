# My Blog

A self-hosted Turborepo monorepo with three services behind Caddy, deployed as a Docker Swarm stack.

| Path                  | What it is                                                                      |
| --------------------- | ------------------------------------------------------------------------------- |
| `apps/web`            | Qwik City frontend with SSR and Tailwind                                        |
| `apps/auth`           | Hono + better-auth. GitHub/Discord OAuth, Postgres, sessions in Redis           |
| `apps/blog-posts`     | Rust (axum + sqlx) API for posts, tags and categories. Writes are admin-only    |
| `apps/caddy`          | Reverse proxy and TLS                                                           |
| `packages/contracts`  | TypeSpec API definition that generates the TS client and the Rust models         |
| `packages/biome-config` | Shared Biome config                                                           |

## Requirements

- Node >= 26, pnpm 12
- Rust (stable)
- Java, which `openapi-generator-cli` needs to generate the contracts
- Postgres (ParadeDB image in production) and Redis

## Local development

```bash
pnpm install
pnpm --filter @shared/contracts build   # generates packages/contracts/{typescript,rust}
cp apps/blog-posts/.env.example apps/blog-posts/.env
pnpm dev
```

| Service      | Default URL              |
| ------------ | ------------------------ |
| `web`        | http://localhost:5173    |
| `blog-posts` | http://localhost:3000 (API docs at `/docs`) |
| `auth`       | http://localhost:3001    |

`auth` reads its config from `/run/secrets/<name>` first and falls back to env vars. You need to set these:
`DATABASE_URL`, `REDIS_URL`, `SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`,
`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`. Create its tables with `pnpm --filter auth migrate`.
`blog-posts` runs its own migrations when it starts.

## Scripts

Run these from the repo root. Turbo runs each one in every workspace.

```bash
pnpm dev | build | lint | format | test | check-types
```

Husky hooks: the pre-commit hook runs gitleaks and lints staged files. The pre-push hook runs type checks, tests and the build.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md).
