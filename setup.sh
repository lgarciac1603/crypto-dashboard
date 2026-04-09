#!/bin/bash
# setup.sh — Clone backend services and prepare config files from .env
set -e

CPP_REST_API_REPO="https://github.com/lgarciac1603/cpp-rest-api.git"
FAVORITES_API_REPO="https://github.com/lgarciac1603/favorites-api.git"

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

# ── Step 4: Write config.local.h from .env ───────────────────────────────────

CONFIG_PATH="backend/cpp-rest-api/src/config/config.local.h"

echo ""
echo "--> Writing $CONFIG_PATH from .env..."

cat > "$CONFIG_PATH" <<EOF
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
echo "To start the full stack run:"
echo "  docker compose up --build"
