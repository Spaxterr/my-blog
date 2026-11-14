FROM caddy:2-builder AS builder

RUN xcaddy build --with github.com/mholt/caddy-ratelimit

# Cloudflare's proxy IPs, so Caddy trusts CF-Connecting-IP only from Cloudflare.
FROM alpine:3 AS cf-ips
RUN apk add --no-cache jq
ADD https://api.cloudflare.com/client/v4/ips /cf-ips.json
RUN jq -er 'select(.success) | .result.ipv4_cidrs + .result.ipv6_cidrs | "trusted_proxies static " + join(" ")' \
    /cf-ips.json > /cloudflare-ips.caddy

FROM caddy:2-alpine

COPY --from=builder /usr/bin/caddy /usr/bin/caddy
COPY --from=cf-ips /cloudflare-ips.caddy /etc/caddy/cloudflare-ips.caddy
COPY apps/caddy/Caddyfile /etc/caddy/Caddyfile
COPY apps/caddy/snippets/ /etc/caddy/snippets/
