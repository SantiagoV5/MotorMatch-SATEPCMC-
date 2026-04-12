# ─────────────────────────────────────────────────────────────────────────────
# ensure-docker.ps1
# ─────────────────────────────────────────────────────────────────────────────
# Script que verifica si Docker Desktop está corriendo.
# Si no está, lo inicia automáticamente.
# 
# Uso: .\ensure-docker.ps1
# 
# O ajusta tu script start.ps1 para ejecutar esto primero.
# ─────────────────────────────────────────────────────────────────────────────

param(
    [switch]$Wait = $false,  # Si $true, espera a que el daemon esté completamente listo
    [int]$TimeoutSeconds = 45
)

$dockerApp = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'

# Función para probar la conexión a Docker
function Test-DockerConnection {
    try {
        docker ps > $null 2>&1
        return $true
    } catch {
        return $false
    }
}

# Verificar si Docker ya está corriendo
if (Test-DockerConnection) {
    Write-Host "✅ Docker ya está corriendo" -ForegroundColor Green
    exit 0
}

# Si Docker no está, revisamos si la aplicación existe
if (-not (Test-Path $dockerApp)) {
    Write-Host "❌ Docker Desktop no encontrado en: $dockerApp" -ForegroundColor Red
    Write-Host "Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Iniciar Docker Desktop
Write-Host "🚀 Iniciando Docker Desktop..." -ForegroundColor Cyan
Start-Process -FilePath $dockerApp -WindowStyle Hidden

# Esperar a que el daemon responda
Write-Host "⏳ Esperando a que Docker inicie..." -ForegroundColor Yellow
$elapsed = 0
$checkInterval = 2

while ($elapsed -lt $TimeoutSeconds) {
    if (Test-DockerConnection) {
        Write-Host "✅ Docker está listo" -ForegroundColor Green
        exit 0
    }
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
    Write-Host "." -NoNewline -ForegroundColor Yellow
}

Write-Host ""
Write-Host "❌ Timeout: Docker no respondió en $TimeoutSeconds segundos" -ForegroundColor Red
exit 1
