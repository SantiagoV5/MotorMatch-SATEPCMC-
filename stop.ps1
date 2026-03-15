# ─────────────────────────────────────────────────────────────────────────────
# stop.ps1 - Detiene todos los servicios de Docker Compose
# ─────────────────────────────────────────────────────────────────────────────
# 
# Uso:
#   .\stop.ps1         # Detener todo
#   .\stop.ps1 -clean  # Detener y eliminar volúmenes (limpia BD)
#   .\stop.ps1 -prod   # Usar docker-compose.prod.yml
#

param(
    [switch]$clean,
    [switch]$prod
)

Write-Host "🛑 Deteniendo MotorMatch..." -ForegroundColor Red

if ($prod) {
    Write-Host "📦 Modo PRODUCCIÓN" -ForegroundColor Cyan
    $compose = "docker-compose -f docker-compose.prod.yml"
} else {
    Write-Host "💻 Modo DESARROLLO" -ForegroundColor Cyan
    $compose = "docker-compose"
}

if ($clean) {
    Write-Host "🧹 Eliminando volúmenes (limpiando BD)..." -ForegroundColor Yellow
    & $compose.Split()[0] $compose.Split()[1..100] down -v
    Write-Host "✅ Contenedores, redes y volúmenes eliminados" -ForegroundColor Green
} else {
    Write-Host "⏸️ Deteniendo contenedores..." -ForegroundColor Yellow
    & $compose.Split()[0] $compose.Split()[1..100] down
    Write-Host "✅ Contenedores detenidos (datos persistentes guardados)" -ForegroundColor Green
}

Write-Host "`n💡 Para reiniciar: .\start.ps1" -ForegroundColor Yellow
