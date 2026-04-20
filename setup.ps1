# setup.ps1 — Clone backend services and prepare config files from .env
param(
    [string]$CppRestApiRepo = "https://github.com/lgarciac1603/cpp-rest-api.git",
    [string]$FavoritesApiRepo = "https://github.com/lgarciac1603/favorites-api.git",
    [string]$CacheProxyApiRepo = "https://github.com/lgarciac1603/cache-proxy-api.git"
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

if (-Not (Test-Path "backend/cache-proxy-api/.git")) {
    Write-Host "--> Cloning cache-proxy-api..." -ForegroundColor Yellow
    git clone $CacheProxyApiRepo backend/cache-proxy-api
} else {
    Write-Host "--> cache-proxy-api already cloned, pulling latest..." -ForegroundColor Yellow
    git -C backend/cache-proxy-api pull
}

# ── Step 4: Write config files from .env ─────────────────────────────────────

# config.h — used by Docker (reads from env vars at runtime, safe to commit)
$configHPath = "backend/cpp-rest-api/src/config/config.h"
Write-Host ""
Write-Host "--> Writing $configHPath..." -ForegroundColor Yellow
$configHContent = @"
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
"@
Set-Content -Path $configHPath -Value $configHContent -Encoding UTF8

# config.local.h — used for native (non-Docker) builds, values from .env
$configLocalPath = "backend/cpp-rest-api/src/config/config.local.h"
Write-Host "--> Writing $configLocalPath from .env..." -ForegroundColor Yellow
$configLocalContent = @"
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
Set-Content -Path $configLocalPath -Value $configLocalContent -Encoding UTF8

Write-Host ""
Write-Host "==> Setup complete." -ForegroundColor Green
Write-Host ""
Write-Host "Services configured: cpp-rest-api, favorites-api, cache-proxy-api" -ForegroundColor Cyan
Write-Host "To start the full stack run:" -ForegroundColor Cyan
Write-Host "  docker compose up --build"

