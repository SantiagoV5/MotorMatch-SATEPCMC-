# ─────────────────────────────────────────────────────────────────────────────
# logs.ps1 - Ver logs de Docker Compose
# ─────────────────────────────────────────────────────────────────────────────
# 
# Uso:
#   .\logs.ps1              # Todos los logs (sigue cambios con -f)
#   .\logs.ps1 -service backend    # Solo logs del backend
#   .\logs.ps1 -service frontend   # Solo logs del frontend
#   .\logs.ps1 -service db         # Solo logs de la base de datos
#   .\logs.ps1 -lines 50    # Últimas 50 líneas
#   .\logs.ps1 -prod        # Usar docker-compose.prod.yml
#

param(
    [string]$service = "",
    [int]$lines = 0,
    [switch]$prod,
    [switch]$no_follow
)

Write-Host "📋 Mostrando logs de MotorMatch..." -ForegroundColor Green

if ($prod) {
    Write-Host "📦 Modo PRODUCCIÓN" -ForegroundColor Cyan
    $compose = "docker-compose -f docker-compose.prod.yml"
} else {
    Write-Host "💻 Modo DESARROLLO" -ForegroundColor Cyan
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

Write-Host "`n🔍 Presiona Ctrl+C para detener los logs" -ForegroundColor Yellow
Write-Host ""

# Ejecutar comando
& $cmd[0] $cmd[1..($cmd.Count - 1)]
