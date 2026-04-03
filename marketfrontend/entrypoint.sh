#!/bin/sh
set -e

echo "🔄 Injecting runtime environment variables..."

# Tìm tất cả file JS đã build và thay thế placeholder bằng giá trị thực
find /app/.next/static /app/.next/server -type f -name "*.js" | while read file; do
  sed -i \
    -e "s|RUNTIME_NEXT_PUBLIC_API_URL|${NEXT_PUBLIC_API_URL}|g" \
    -e "s|RUNTIME_NEXT_PUBLIC_ADDRESS_KEY|${NEXT_PUBLIC_ADDRESS_KEY}|g" \
    -e "s|RUNTIME_NEXT_PUBLIC_PROVINCE_API|${NEXT_PUBLIC_PROVINCE_API}|g" \
    "$file"
done

echo "✅ Environment variables injected. Starting server..."
exec node server.js