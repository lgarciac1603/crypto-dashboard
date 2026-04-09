#!/bin/bash
# setup.sh — Clone backend services and launch the full stack
set -e

CPP_REST_API_REPO="https://github.com/lgarciac1603/cpp-rest-api.git"
FAVORITES_API_REPO="https://github.com/lgarciac1603/favorites-api.git"

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

echo ""
echo "==> Backend services ready."
echo ""
echo "To start the full stack run:"
echo "  docker compose up --build"
