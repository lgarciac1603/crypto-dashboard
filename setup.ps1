# setup.ps1 — Clone backend services and launch the full stack
param(
    [string]$CppRestApiRepo = "https://github.com/lgarciac1603/cpp-rest-api.git",
    [string]$FavoritesApiRepo = "https://github.com/lgarciac1603/favorites-api.git"
)

$ErrorActionPreference = "Stop"

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

Write-Host ""
Write-Host "==> Backend services ready." -ForegroundColor Green
Write-Host ""
Write-Host "To start the full stack run:" -ForegroundColor Cyan
Write-Host "  docker compose up --build"
