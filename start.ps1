# ─────────────────────────────────────────────────────────────────────────────
# start.ps1 - Inicia todos los servicios de Docker Compose
# ─────────────────────────────────────────────────────────────────────────────
# 
# Uso:
#   .\start.ps1           # Inicio normal
#   .\start.ps1 -build    # Reconstruir imágenes
#   .\start.ps1 -prod     # Usar docker-compose.prod.yml
#

param(
    [switch]$build,
    [switch]$prod
)

Write-Host "🚀 Iniciando MotorMatch..." -ForegroundColor Green

if ($prod) {
    Write-Host "📦 Modo PRODUCCIÓN" -ForegroundColor Cyan
    $compose = "docker-compose -f docker-compose.prod.yml"
} else {
    Write-Host "💻 Modo DESARROLLO" -ForegroundColor Cyan
    $compose = "docker-compose"
}

if ($build) {
    Write-Host "🔨 Reconstruyendo imágenes..." -ForegroundColor Yellow
    & $compose.Split()[0] $compose.Split()[1..100] up --build -d
} else {
    Write-Host "▶️ Iniciando contenedores..." -ForegroundColor Yellow
    & $compose.Split()[0] $compose.Split()[1..100] up -d
}

Start-Sleep -Seconds 3

Write-Host "`n✅ Servicios iniciados:" -ForegroundColor Green
& docker-compose ps

Write-Host "`n📍 Acceso a la aplicación:" -ForegroundColor Green
Write-Host "   Frontend:  http://localhost" -ForegroundColor Cyan
Write-Host "   Backend:   http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "   Health:    http://localhost:3000/api/health" -ForegroundColor Cyan

Write-Host "`n📝 Para ver logs: .\logs.ps1" -ForegroundColor Yellow
Write-Host "🛑 Para detener: .\stop.ps1" -ForegroundColor Yellow
