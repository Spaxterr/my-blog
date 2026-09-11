#!/bin/bash

load_env() {
  local root
  root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

  if [ -f "$root/.env" ]; then
    set -a
    # shellcheck disable=SC1090
    . "$root/.env"
    set +a
  else
    echo "warning: no $root/.env — copy .env.example to .env" >&2
  fi

  : "${TAG:=$(git -C "$root" rev-parse --short HEAD)}"
  : "${IMAGE_PREFIX:=my-blog}"
  export TAG IMAGE_PREFIX

  cd "$root" || return
}
