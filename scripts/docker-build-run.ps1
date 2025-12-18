# PowerShell script to build the backend Docker image and show run command
param()
$root = Split-Path -Parent $PSScriptRoot
docker build -t time-tracking-backend:local -f "$root\packages\backend\Dockerfile" $root
Write-Host "Run with: docker run -e DATABASE_URL='<your-db>' -e JWT_SECRET='<secret>' -p 3001:3001 time-tracking-backend:local"
