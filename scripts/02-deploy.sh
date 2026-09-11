#!/bin/bash
set -euo pipefail
. "$(dirname "$0")/env.sh"
load_env

docker stack deploy -c docker-stack.yml \
  --resolve-image "${RESOLVE_IMAGE:-never}" my-blog

docker stack services my-blog
