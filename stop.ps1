# Detiene todos los servicios de Docker Compose
# Uso: .\stop.ps1 [opciones]
#   -clean : Eliminar volumenes (limpia BD local)
#   -prod  : Usar docker-compose.prod.yml

param(
    [switch]$clean,
    [switch]$prod
)

# Asegurar que Docker esta corriendo
& .\ensure-docker.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "No se puede continuar sin Docker" -ForegroundColor Red
    exit 1
}

Write-Host "Deteniendo MotorMatch..." -ForegroundColor Red

if ($prod) {
    Write-Host "Modo PRODUCCION" -ForegroundColor Cyan
    $compose = "docker-compose -f docker-compose.prod.yml"
} else {
    Write-Host "Modo DESARROLLO" -ForegroundColor Cyan
    $compose = "docker-compose"
}

if ($clean) {
    Write-Host "Eliminando volumenes (limpiando BD)..." -ForegroundColor Yellow
    & $compose.Split()[0] $compose.Split()[1..100] down -v
    Write-Host "Contenedores, redes y volumenes eliminados" -ForegroundColor Green
} else {
    Write-Host "Deteniendo contenedores..." -ForegroundColor Yellow
    & $compose.Split()[0] $compose.Split()[1..100] down
    Write-Host "Contenedores detenidos (datos persistentes guardados)" -ForegroundColor Green
}

Write-Host "`nPara reiniciar: .\start.ps1" -ForegroundColor Yellow
