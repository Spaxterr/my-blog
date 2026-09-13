FROM ghcr.io/pnpm/pnpm:12 AS base

ENV NODE_ENV="production"

RUN pnpm runtime set node 26 -g
WORKDIR /app
COPY . .

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run --filter=auth build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/apps/auth/dist/ /app/apps/auth/dist/
WORKDIR /app/apps/auth

CMD ["node", "dist/index.js"]
