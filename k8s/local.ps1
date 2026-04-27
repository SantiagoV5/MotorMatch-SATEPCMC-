param(
    [Parameter(Position=0, Mandatory=$false)]
    [string]$Command
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$RootDir = (Get-Item "$ScriptDir\..").FullName
$Namespace = "motormatch"
$ClusterName = "motormatch-local"

function Invoke-Up {
    # Check for Kind
    if (!(Get-Command kind -ErrorAction SilentlyContinue)) {
        Write-Error "Falta instalar 'kind' (Ej: winget install Kubernetes.kind)"
    }

    # Ensure cluster exists
    $clusters = kind get clusters 2>$null
    if ($clusters -notcontains $ClusterName) {
        Write-Host "Creando cluster local de Kubernetes con kind: $ClusterName"
        kind create cluster --name $ClusterName
    } else {
        Write-Host "Usando cluster existente: $ClusterName"
    }

    # Always target the right context
    kubectl config use-context "kind-$ClusterName" | Out-Null

    # Apply Namespace
    kubectl apply -f "$ScriptDir\overlays\local\namespace.yaml" | Out-Null

    # Generate Kubernetes Secret from .env smoothly
    $envFile = "$RootDir\.env"
    if (-not (Test-Path $envFile)) {
        Write-Error "Falta el archivo .env en la raiz del proyecto ($RootDir)"
    }

    Write-Host "Inyectando variables de entorno desde .env..."
    $secretsArgs = @()
    foreach($line in (Get-Content $envFile)) {
        if ($line -match "^([^#\s]+?)=(.*)") {
            $key = $matches[1]
            $val = $matches[2].Trim(" `"'") # Quitar posibles comillas o espacios extras
            $secretsArgs += "--from-literal=$key=`"$val`""
        }
    }
    
    $secretCmd = "kubectl create secret generic motormatch-secrets -n $Namespace $($secretsArgs -join ' ') --dry-run=client -o yaml | kubectl apply -f -"
    Invoke-Expression $secretCmd | Out-Null

    # Build Docker Images
    Write-Host "Construyendo contenedores (Backend y Frontend)..."
    docker build -t motormatch-backend:latest -f "$RootDir\backend\Dockerfile" "$RootDir\backend" | Out-Null
    docker build -t motormatch-frontend:latest -f "$RootDir\Frontend\Dockerfile" "$RootDir\Frontend" | Out-Null

    # Load Images to Kind
    Write-Host "Cargando imagenes en el cluster local..."
    kind load docker-image motormatch-backend:latest motormatch-frontend:latest --name $ClusterName

    # Apply deployments
    Write-Host "Aplicando recursos de k8s (Kustomize)..."
    kubectl apply -k "$ScriptDir\overlays\local" | Out-Null
    
    # Restart deployments to pick up new images/secrets
    kubectl rollout restart deployment/backend -n $Namespace | Out-Null
    kubectl rollout restart deployment/frontend -n $Namespace | Out-Null

    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "Tu infraestructura ha arrancado en local. " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Manten este comando ejecutandose para acceder al Frontend:" -ForegroundColor Cyan
    Write-Host "> kubectl port-forward svc/frontend 8080:80 -n motormatch " -ForegroundColor Yellow
}

function Invoke-Down {
    Write-Host "Eliminando aplicacion del cluster local..."
    kubectl delete -k "$ScriptDir\overlays\local"
}

function Invoke-Status {
    kubectl get pods,svc,secrets -n $Namespace
}

switch ($Command) {
    "up" { Invoke-Up }
    "down" { Invoke-Down }
    "status" { Invoke-Status }
    default {
        Write-Host "Uso: .\k8s\local.ps1 <up|down|status>"
        Write-Host ""
        Write-Host "  up      Construye e inicializa todo el cluster (K8s en Windows)"
        Write-Host "  down    Apaga y borra los recursos de K8s"
        Write-Host "  status  Muestra la salud actual de los Pods"
    }
}