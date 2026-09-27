#!/bin/sh
set -eu

if [ -n "${VITE_API_KEY:-}" ]; then
  find /usr/share/nginx/html/assets -name '*.js' -exec \
    sed -i "s|__VITE_API_KEY_PLACEHOLDER__|${VITE_API_KEY}|g" {} +
fi

if [ -n "${VITE_API_BASE_URL:-}" ]; then
  find /usr/share/nginx/html/assets -name '*.js' -exec \
    sed -i "s|__VITE_API_BASE_URL_PLACEHOLDER__|${VITE_API_BASE_URL}|g" {} +
fi

exec nginx -g 'daemon off;'
