#!/usr/bin/env pwsh
# db.ps1 — Quick psql helper for crypto-dashboard
# Usage: .\db.ps1 [command]
#   no args       → opens interactive psql shell
#   users         → list all users
#   favorites     → list all favorites
#   favorites <u> → list favorites for a specific user (by username or id)
#   tables        → list all tables
#   sql "<query>" → run a custom SQL query

# Load .env
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match '^\s*[^#]\S+=\S+' } | ForEach-Object {
        $parts = $_ -split '=', 2
        [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim())
    }
}

$DB_NAME = $env:DB_NAME ?? "usersdb"
$DB_USER = $env:DB_USER ?? "adminuser"
$CONTAINER = "app-postgres"

function Invoke-Psql($query) {
    docker exec -it $CONTAINER psql -U $DB_USER -d $DB_NAME -c $query
}

switch ($args[0]) {
    "users" {
        Write-Host "`n=== Users ===" -ForegroundColor Cyan
        Invoke-Psql "SELECT id, username, email, created_at FROM users ORDER BY id;"
    }
    "favorites" {
        if ($args[1]) {
            $filter = $args[1]
            Write-Host "`n=== Favorites for '$filter' ===" -ForegroundColor Cyan
            Invoke-Psql @"
SELECT f.id, u.username, f.crypto_id, f.crypto_name, f.created_at
FROM user_favorites f
JOIN users u ON f.user_id = u.id
WHERE u.username = '$filter' OR u.id::text = '$filter'
ORDER BY f.created_at DESC;
"@
        } else {
            Write-Host "`n=== All Favorites ===" -ForegroundColor Cyan
            Invoke-Psql @"
SELECT f.id, u.username, f.crypto_id, f.crypto_name, f.created_at
FROM user_favorites f
JOIN users u ON f.user_id = u.id
ORDER BY f.created_at DESC;
"@
        }
    }
    "tables" {
        Write-Host "`n=== Tables ===" -ForegroundColor Cyan
        Invoke-Psql "\dt"
    }
    "sql" {
        if (-not $args[1]) { Write-Error "Usage: .\db.ps1 sql ""<query>"""; exit 1 }
        Invoke-Psql $args[1]
    }
    default {
        Write-Host "Opening psql shell (DB: $DB_NAME, User: $DB_USER)..." -ForegroundColor Green
        docker exec -it $CONTAINER psql -U $DB_USER -d $DB_NAME
    }
}
