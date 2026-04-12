# Ver logs de Docker Compose
# Uso: .\logs.ps1 [opciones]
#   -service backend  : Solo logs del backend
#   -service frontend : Solo logs del frontend
#   -service db       : Solo logs de la BD
#   -lines 50         : Ultimas N lineas
#   -prod             : Usar docker-compose.prod.yml

param(
    [string]$service = "",
    [int]$lines = 0,
    [switch]$prod,
    [switch]$no_follow
)

# Asegurar que Docker esta corriendo
& .\ensure-docker.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "No se puede continuar sin Docker" -ForegroundColor Red
    exit 1
}

Write-Host "Mostrando logs de MotorMatch..." -ForegroundColor Green

if ($prod) {
    Write-Host "Modo PRODUCCION" -ForegroundColor Cyan
    $compose = "docker-compose -f docker-compose.prod.yml"
} else {
    Write-Host "Modo DESARROLLO" -ForegroundColor Cyan
    $compose = "docker-compose"
}

# Construir comando
[System.Collections.ArrayList]$cmd = @($compose.Split()[0], $compose.Split()[1..100], "logs")

if (-not $no_follow) {
    $cmd.Add("-f") | Out-Null  # Sigue los logs
}

if ($lines -gt 0) {
    $cmd.Add("--tail=$lines") | Out-Null
}

if ($service -ne "") {
    $cmd.Add($service) | Out-Null
}

Write-Host "`nPresiona Ctrl+C para detener los logs" -ForegroundColor Yellow
Write-Host ""

# Ejecutar comando
& $cmd[0] $cmd[1..($cmd.Count - 1)]
