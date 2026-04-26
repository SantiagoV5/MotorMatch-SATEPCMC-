<#
.SYNOPSIS
    Script de despliegue local de MotorMatch en Kubernetes para Windows (PowerShell).

.DESCRIPTION
    Este script construye las imágenes, crea el cluster (si se usa kind), inyecta
    los secretos desde el archivo .env, aplica el overlay de kustomize y expone
    el frontend en http://localhost:8080.

.EXAMPLE
    .\local.ps1 up
    .\local.ps1 down
    .\local.ps1 status
    .\local.ps1 logs backend
#>

Param (
    [Parameter(Position = 0, Mandatory = $false)]
    [ValidateSet("up", "down", "status", "logs")]
    [string]$Command = "help",

    [Parameter(Position = 1, Mandatory = $false)]
    [ValidateSet("backend", "frontend")]
    [string]$Target = ""
)

$ErrorActionPreference = "Stop"

# Directorios y variables principales
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = (Resolve-Path "$ScriptDir\..").Path
$LocalOverlayDir = "$ScriptDir\overlays\local"

$Namespace = "motormatch"
$BackendImage = "motormatch-backend:latest"
$FrontendImage = "motormatch-frontend:latest"

function Show-Usage {
    Write-Host "Usage: .\local.ps1 <up|down|status|logs>"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  up       Construye imágenes, aplica la configuración local, espera"
    Write-Host "           a que estén listos y expone el frontend en http://localhost:8080."
    Write-Host "  down     Detiene el reenvío de puertos y elimina los recursos locales."
    Write-Host "  status   Muestra los pods y servicios en el namespace motormatch."
    Write-Host "  logs     Muestra los registros (logs) de un componente: backend o frontend."
}

function Require-Tools {
    if (-not (Get-Command "kubectl" -ErrorAction SilentlyContinue)) {
        Write-Error "kubectl es requerido. Por favor instálalo."
    }
    if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
        Write-Error "docker es requerido. Por favor instálalo (ej. Docker Desktop)."
    }
}

function Get-ClusterContext {
    $context = (kubectl config current-context 2>$null)
    if ($LASTEXITCODE -eq 0) { return $context }
    return ""
}

function Ensure-ClusterAccess {
    $context = Get-ClusterContext

    if ([string]::IsNullOrWhiteSpace($context)) {
        Write-Error "No hay un contexto de Kubernetes configurado. Inicia Docker Desktop, Minikube o Kind primero."
    }

    # Verificar si el cluster responde
    kubectl cluster-info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "kubectl puede ver el contexto '$context', pero no puede alcanzar el cluster. Asegúrate de que el cluster esté corriendo."
    }
}

function Build-Images {
    Write-Host "Construyendo imagen del backend: $BackendImage" -ForegroundColor Cyan
    docker build -t $BackendImage -f "$RootDir\backend\Dockerfile" "$RootDir\backend"

    Write-Host "Construyendo imagen del frontend: $FrontendImage" -ForegroundColor Cyan
    docker build -t $FrontendImage -f "$RootDir\Frontend\Dockerfile" "$RootDir\Frontend"
}

function Load-ImagesIntoCluster {
    $context = Get-ClusterContext

    if ($context -match "^kind-") {
        $kindClusterName = $context -replace "^kind-", ""
        if (Get-Command "kind" -ErrorAction SilentlyContinue) {
            Write-Host "Cargando imágenes en el cluster kind: $kindClusterName" -ForegroundColor Cyan
            kind load docker-image $BackendImage --name $kindClusterName
            kind load docker-image $FrontendImage --name $kindClusterName
            return
        }
    }

    if ($context -eq "minikube") {
        if (Get-Command "minikube" -ErrorAction SilentlyContinue) {
            Write-Host "Cargando imágenes en minikube" -ForegroundColor Cyan
            minikube image load $BackendImage
            minikube image load $FrontendImage
            return
        }
    }

    Write-Host "Omitiendo carga explícita de imágenes. El contexto actual es '$context'." -ForegroundColor Yellow
}

function Create-SupabaseSecret {
    $envFile = "$RootDir\.env"

    if (-not (Test-Path $envFile)) {
        Write-Error "Falta el archivo $envFile. Asegúrate de crear este archivo con tus credenciales de Supabase (DATABASE_URL, DIRECT_URL, JWT_SECRET)."
    }

    Write-Host "Leyendo secretos desde $envFile" -ForegroundColor Cyan
    
    # Leer el archivo .env, ignorar lineas vacías y comentarios, y extraer variables
    $envVars = @{}
    Get-Content $envFile | Where-Object { $_ -match "^[^#]" -and $_ -match "=" } | ForEach-Object {
        # Dividir por el primer signo igual
        $index = $_.IndexOf("=")
        if ($index -ge 0) {
            $key = $_.Substring(0, $index).Trim()
            $value = $_.Substring($index + 1).Trim(" `"'") # Remover comillas si existen
            $envVars[$key] = $value
        }
    }

    $dbUrl = $envVars["DATABASE_URL"]
    $dirUrl = $envVars["DIRECT_URL"]
    $jwt = $envVars["JWT_SECRET"]
    $smtpUser = if ($envVars.Contains("SMTP_USER")) { $envVars["SMTP_USER"] } else { "" }
    $smtpPass = if ($envVars.Contains("SMTP_PASS")) { $envVars["SMTP_PASS"] } else { "" }

    if ([string]::IsNullOrEmpty($dbUrl)) { Write-Error "DATABASE_URL es requerido en .env" }
    if ([string]::IsNullOrEmpty($dirUrl)) { Write-Error "DIRECT_URL es requerido en .env" }
    if ([string]::IsNullOrEmpty($jwt)) { Write-Error "JWT_SECRET es requerido en .env" }

    # Crear el secreto en kubernetes
    Write-Host "Creando secreto en kubernetes..." -ForegroundColor Cyan
    $secretCmd = "kubectl create secret generic motormatch-secrets -n $Namespace --from-literal=DATABASE_URL=`"$dbUrl`" --from-literal=DIRECT_URL=`"$dirUrl`" --from-literal=JWT_SECRET=`"$jwt`" --from-literal=SMTP_USER=`"$smtpUser`" --from-literal=SMTP_PASS=`"$smtpPass`" --dry-run=client -o yaml | kubectl apply -f -"
    Invoke-Expression $secretCmd
}

function Apply-Bundle {
    Write-Host "Aplicando configuraciones de Kustomize..." -ForegroundColor Cyan
    kubectl delete statefulset/postgresql service/postgresql job/prisma-db-sync -n $Namespace --ignore-not-found 2>&1 | Out-Null
    kubectl apply -f "$LocalOverlayDir\namespace.yaml"
    Create-SupabaseSecret
    kubectl apply -k "$LocalOverlayDir"
    kubectl rollout restart deployment/backend -n $Namespace
}

function Wait-ForResources {
    Write-Host "Esperando a que los deployments estén listos..." -ForegroundColor Cyan
    kubectl rollout status deployment/backend -n $Namespace --timeout=300s
    kubectl rollout status deployment/frontend -n $Namespace --timeout=300s
}

function Stop-PortForward {
    # Buscar procesos de port-forward de kubectl y terminarlos
    Get-Process kubectl -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "port-forward" -and $_.CommandLine -match "8080:80" } | Stop-Process -Force -ErrorAction SilentlyContinue
}

function Start-PortForward {
    Stop-PortForward
    Write-Host "Iniciando Port-Forward en segundo plano..." -ForegroundColor Cyan
    
    # Iniciar port-forward sin bloquear la terminal
    Start-Process -FilePath "kubectl" -ArgumentList "port-forward -n $Namespace svc/frontend 8080:80" -WindowStyle Hidden
    
    Write-Host "🚀 Frontend expuesto en http://localhost:8080" -ForegroundColor Green
}

function Up {
    Require-Tools
    Ensure-ClusterAccess
    Build-Images
    Load-ImagesIntoCluster
    Apply-Bundle
    Wait-ForResources
    Start-PortForward
}

function Down {
    Require-Tools
    Stop-PortForward
    Write-Host "Eliminando recursos de kubernetes..." -ForegroundColor Cyan
    kubectl delete statefulset/postgresql service/postgresql job/prisma-db-sync -n $Namespace --ignore-not-found 2>&1 | Out-Null
    kubectl delete -k "$LocalOverlayDir" --ignore-not-found
    Write-Host "✅ Entorno detenido." -ForegroundColor Green
}

function Status {
    Require-Tools
    Ensure-ClusterAccess
    kubectl get pods,svc -n $Namespace
}

function Logs {
    Require-Tools
    Ensure-ClusterAccess
    
    if ([string]::IsNullOrEmpty($Target)) {
        Write-Error "Debes especificar el componente: backend o frontend. Ejemplo: .\local.ps1 logs backend"
    }

    if ($Target -in @("backend", "frontend")) {
        kubectl logs -n $Namespace -f deployment/$Target
    } else {
        Write-Error "Objetivo no válido. Usa 'backend' o 'frontend'."
    }
}

# Lógica del switch principal
switch ($Command) {
    "up" { Up }
    "down" { Down }
    "status" { Status }
    "logs" { Logs }
    "help" { Show-Usage }
    default { Show-Usage }
}