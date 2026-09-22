FROM ghcr.io/pnpm/pnpm:12 AS build

ENV NODE_ENV="production"

RUN pnpm runtime set node 26 -g
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run --filter=web build

FROM node:26-alpine
ENV NODE_ENV="production"
# Both paths matter: CMD is relative to WORKDIR, and the node-server adapter
# resolves its static root as <entry>/../../dist — so dist must sit beside server/.
COPY --from=build /app/apps/web/server/ /app/apps/web/server/
COPY --from=build /app/apps/web/dist/ /app/apps/web/dist/
WORKDIR /app/apps/web
USER node

CMD ["node", "server/entry.node-server.js"]
