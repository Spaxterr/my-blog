#!/bin/bash
set -euo pipefail
. "$(dirname "$0")/env.sh"
load_env

# The images are environment-agnostic — every hostname is read at runtime — so
# the environment only decides where they are tagged and pushed.
for s in auth web blog-posts; do
  docker build -f "apps/$s/Dockerfile" -t "$IMAGE_PREFIX/$s:$TAG" .
done

if [ "${PUSH:-0}" = "1" ]; then
  for s in auth web blog-posts; do
    docker push "$IMAGE_PREFIX/$s:$TAG"
  done
fi
