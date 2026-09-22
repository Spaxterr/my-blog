FROM ghcr.io/pnpm/pnpm:12 AS build

ENV NODE_ENV="production"

RUN pnpm runtime set node 26 -g
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run --filter=auth build
# Bundles auth's own prod deps into a plain node_modules, without the rest of the workspace.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm deploy --filter=auth --prod /out

FROM node:26-alpine
ENV NODE_ENV="production"
COPY --from=build /out/node_modules/ /app/apps/auth/node_modules/
COPY --from=build /out/package.json /app/apps/auth/package.json
COPY --from=build /app/apps/auth/dist/ /app/apps/auth/dist/
WORKDIR /app/apps/auth
USER node

CMD ["node", "dist/index.js"]
