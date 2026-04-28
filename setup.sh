#!/bin/bash
# setup.sh — Clone backend services and prepare config files from .env
set -e

CPP_REST_API_REPO="https://github.com/lgarciac1603/cpp-rest-api.git"
FAVORITES_API_REPO="https://github.com/lgarciac1603/favorites-api.git"
CACHE_PROXY_API_REPO="https://github.com/lgarciac1603/cache-proxy-api.git"

# ── Step 1: Ensure .env exists ───────────────────────────────────────────────

if [ ! -f ".env" ]; then
  echo "==> .env not found. Creating from .env.example..."
  cp .env.example .env
  echo "    Edit .env with your values, then re-run this script."
  echo "    At minimum review JWT_SECRET and DB_PASS."
  exit 0
fi

# ── Step 2: Parse .env ───────────────────────────────────────────────────────

JWT_SECRET="dev-secret-key"
CORS_ALLOW_ORIGIN="http://localhost:4200"
DB_NAME="apidb"
DB_USER="apiuser_test"
DB_PASS="apipass_test"

while IFS='=' read -r key value; do
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  key="${key// /}"
  value="${value// /}"
  case "$key" in
    JWT_SECRET)        JWT_SECRET="$value" ;;
    CORS_ALLOW_ORIGIN) CORS_ALLOW_ORIGIN="$value" ;;
    DB_NAME)           DB_NAME="$value" ;;
    DB_USER)           DB_USER="$value" ;;
    DB_PASS)           DB_PASS="$value" ;;
  esac
done < .env

# ── Step 3: Clone or update repos ────────────────────────────────────────────

echo ""
echo "==> Setting up backend services..."

mkdir -p backend

if [ ! -d "backend/cpp-rest-api/.git" ]; then
  echo "--> Cloning cpp-rest-api..."
  git clone "$CPP_REST_API_REPO" backend/cpp-rest-api
else
  echo "--> cpp-rest-api already cloned, pulling latest..."
  git -C backend/cpp-rest-api pull
fi

if [ ! -d "backend/favorites-api/.git" ]; then
  echo "--> Cloning favorites-api..."
  git clone "$FAVORITES_API_REPO" backend/favorites-api
else
  echo "--> favorites-api already cloned, pulling latest..."
  git -C backend/favorites-api pull
fi

if [ ! -d "backend/cache-proxy-api/.git" ]; then
  echo "--> Cloning cache-proxy-api..."
  git clone "$CACHE_PROXY_API_REPO" backend/cache-proxy-api
else
  echo "--> cache-proxy-api already cloned, pulling latest..."
  git -C backend/cache-proxy-api pull
fi

# ── Step 4: Write config files from .env ─────────────────────────────────────

# config.h — used by Docker (reads from env vars at runtime, safe to commit)
CONFIG_H_PATH="backend/cpp-rest-api/src/config/config.h"
echo ""
echo "--> Writing $CONFIG_H_PATH..."

cat > "$CONFIG_H_PATH" <<'CONFIGH'
#pragma once

#include <cstdlib>
#include <string>

inline std::string get_env(const char* key, const char* default_val) {
    const char* val = std::getenv(key);
    return val ? val : default_val;
}

inline const char* get_env_cstr(const char* key, const char* default_val) {
    const char* val = std::getenv(key);
    return val ? val : default_val;
}

#define DB_HOST           get_env_cstr("DB_HOST",           "localhost")
#define DB_PORT           get_env_cstr("DB_PORT",           "5432")
#define DB_NAME           get_env_cstr("DB_NAME",           "apidb")
#define DB_USER           get_env_cstr("DB_USER",           "apiuser_test")
#define DB_PASS           get_env_cstr("DB_PASS",           "apipass_test")
#define APP_PORT          get_env_cstr("APP_PORT",          "8080")
#define JWT_SECRET        get_env("JWT_SECRET",             "dev-secret-key")
#define CORS_ALLOW_ORIGIN get_env_cstr("CORS_ALLOW_ORIGIN", "http://localhost:4200")
CONFIGH

# config.local.h — used for native (non-Docker) builds, values from .env
CONFIG_LOCAL_PATH="backend/cpp-rest-api/src/config/config.local.h"
echo "--> Writing $CONFIG_LOCAL_PATH from .env..."

cat > "$CONFIG_LOCAL_PATH" <<EOF
#pragma once

#define DB_HOST "localhost"
#define DB_PORT "5432"
#define DB_NAME "${DB_NAME}"
#define DB_USER "${DB_USER}"
#define DB_PASS "${DB_PASS}"
#define APP_PORT "8080"
#define JWT_SECRET "${JWT_SECRET}"
#define CORS_ALLOW_ORIGIN "${CORS_ALLOW_ORIGIN}"
EOF

echo ""
echo "==> Setup complete."
echo ""
echo "Services configured: cpp-rest-api, favorites-api, cache-proxy-api"
echo "To start the full stack run:"
echo "  docker compose up --build"
