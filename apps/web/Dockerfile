FROM ghcr.io/pnpm/pnpm:12 AS base

ENV NODE_ENV="production"

RUN pnpm runtime set node 26 -g
WORKDIR /app
COPY . .

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run --filter=web build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
# Both paths matter: CMD is relative to WORKDIR, and the node-server adapter
# resolves its static root as <entry>/../../dist — so dist must sit beside server/.
COPY --from=build /app/apps/web/server/ /app/apps/web/server/
COPY --from=build /app/apps/web/dist/ /app/apps/web/dist/
WORKDIR /app/apps/web

CMD ["node", "server/entry.node-server.js"]
