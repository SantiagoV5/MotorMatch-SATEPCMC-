# Inicia todos los servicios de Docker Compose
# Uso: .\start.ps1 [opciones]
#   -build : Reconstruir imagenes
#   -prod  : Usar docker-compose.prod.yml

param(
    [switch]$build,
    [switch]$prod
)

# Asegurar que Docker esta corriendo
& .\ensure-docker.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "No se puede continuar sin Docker" -ForegroundColor Red
    exit 1
}

Write-Host "Iniciando MotorMatch..." -ForegroundColor Green

if ($prod) {
    Write-Host "Modo PRODUCCION" -ForegroundColor Cyan
    $compose = "docker-compose -f docker-compose.prod.yml"
} else {
    Write-Host "Modo DESARROLLO" -ForegroundColor Cyan
    $compose = "docker-compose"
}

if ($build) {
    Write-Host "Reconstruyendo imagenes..." -ForegroundColor Yellow
    & $compose.Split()[0] $compose.Split()[1..100] up --build -d
} else {
    Write-Host "Iniciando contenedores..." -ForegroundColor Yellow
    & $compose.Split()[0] $compose.Split()[1..100] up -d
}

Start-Sleep -Seconds 3

Write-Host "`nServicios iniciados:" -ForegroundColor Green
& docker-compose ps

Write-Host "`nAcceso a la aplicacion:" -ForegroundColor Green
Write-Host "   Frontend:  http://localhost" -ForegroundColor Cyan
Write-Host "   Backend:   http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "   Health:    http://localhost:3000/api/health" -ForegroundColor Cyan

Write-Host "`nPara ver logs: .\logs.ps1" -ForegroundColor Yellow
Write-Host "Para detener: .\stop.ps1" -ForegroundColor Yellow
