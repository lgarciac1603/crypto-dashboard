# setup.ps1 — Clone backend services and prepare config files from .env
param(
    [string]$CppRestApiRepo = "https://github.com/lgarciac1603/cpp-rest-api.git",
    [string]$FavoritesApiRepo = "https://github.com/lgarciac1603/favorites-api.git"
)

$ErrorActionPreference = "Stop"

# ── Step 1: Ensure .env exists ───────────────────────────────────────────────

if (-Not (Test-Path ".env")) {
    Write-Host "==> .env not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "    Edit .env with your values, then re-run this script." -ForegroundColor Yellow
    Write-Host "    At minimum review JWT_SECRET and DB_PASS." -ForegroundColor Yellow
    exit 0
}

# ── Step 2: Parse .env ───────────────────────────────────────────────────────

$envVars = @{
    JWT_SECRET        = "dev-secret-key"
    CORS_ALLOW_ORIGIN = "http://localhost:4200"
    DB_NAME           = "apidb"
    DB_USER           = "apiuser_test"
    DB_PASS           = "apipass_test"
}

foreach ($line in Get-Content ".env") {
    if ($line -match "^\s*#" -or $line -match "^\s*$") { continue }
    if ($line -match "^([^=]+)=(.*)$") {
        $envVars[$Matches[1].Trim()] = $Matches[2].Trim()
    }
}

# ── Step 3: Clone or update repos ────────────────────────────────────────────

Write-Host ""
Write-Host "==> Setting up backend services..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path "backend" | Out-Null

if (-Not (Test-Path "backend/cpp-rest-api/.git")) {
    Write-Host "--> Cloning cpp-rest-api..." -ForegroundColor Yellow
    git clone $CppRestApiRepo backend/cpp-rest-api
} else {
    Write-Host "--> cpp-rest-api already cloned, pulling latest..." -ForegroundColor Yellow
    git -C backend/cpp-rest-api pull
}

if (-Not (Test-Path "backend/favorites-api/.git")) {
    Write-Host "--> Cloning favorites-api..." -ForegroundColor Yellow
    git clone $FavoritesApiRepo backend/favorites-api
} else {
    Write-Host "--> favorites-api already cloned, pulling latest..." -ForegroundColor Yellow
    git -C backend/favorites-api pull
}

# ── Step 4: Write config.local.h from .env ───────────────────────────────────

$configPath = "backend/cpp-rest-api/src/config/config.local.h"

Write-Host ""
Write-Host "--> Writing $configPath from .env..." -ForegroundColor Yellow

$configContent = @"
#pragma once

#define DB_HOST "localhost"
#define DB_PORT "5432"
#define DB_NAME "$($envVars['DB_NAME'])"
#define DB_USER "$($envVars['DB_USER'])"
#define DB_PASS "$($envVars['DB_PASS'])"
#define APP_PORT "8080"
#define JWT_SECRET "$($envVars['JWT_SECRET'])"
#define CORS_ALLOW_ORIGIN "$($envVars['CORS_ALLOW_ORIGIN'])"
"@

Set-Content -Path $configPath -Value $configContent -Encoding UTF8

Write-Host ""
Write-Host "==> Setup complete." -ForegroundColor Green
Write-Host ""
Write-Host "To start the full stack run:" -ForegroundColor Cyan
Write-Host "  docker compose up --build"

