#!/bin/sh
set -e

echo "Injecting runtime environment variables..."

find /app/.next/static /app/.next/server -type f -name "*.js" | while read file; do
  sed -i \
    -e "s|RUNTIME_NEXT_PUBLIC_LOGISTIC_URL|${NEXT_PUBLIC_LOGISTIC_URL}|g" \
    -e "s|RUNTIME_NEXT_PUBLIC_LOGISTICS_API_BASE_URL|${NEXT_PUBLIC_LOGISTICS_API_BASE_URL}|g" \
    "$file"
done

echo "Environment variables injected. Starting server..."
exec node server.js
