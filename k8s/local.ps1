param(
    [Parameter(Position=0, Mandatory=$false)]
    [string]$Command
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$RootDir = (Get-Item "$ScriptDir\..").FullName
$Namespace = "motormatch"
$ClusterName = "motormatch-local"

function Invoke-Native {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Exe,

        [Parameter(ValueFromRemainingArguments=$true)]
        [string[]]$Args
    )

    & $Exe @Args
    if ($LASTEXITCODE -ne 0) {
        throw "El comando '$Exe $($Args -join ' ')' fallo con codigo $LASTEXITCODE"
    }
}

function Test-ClusterReachable {
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"

    try {
        kubectl --context "kind-$ClusterName" cluster-info --request-timeout=5s 2>$null | Out-Null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Wait-ClusterReady {
    Write-Host "Esperando a que el API server del cluster este disponible..."

    for ($i = 1; $i -le 30; $i++) {
        if (Test-ClusterReachable) {
            return
        }
        Start-Sleep -Seconds 2
    }

    throw "El cluster kind-$ClusterName existe, pero su API server no responde. Ejecuta '.\k8s\local.ps1 recreate' o revisa Docker Desktop."
}

function Invoke-Up {
    # Check for Kind
    if (!(Get-Command kind -ErrorAction SilentlyContinue)) {
        Write-Error "Falta instalar 'kind' (Ej: winget install Kubernetes.kind)"
    }

    # Ensure cluster exists
    try {
        $clusters = kind get clusters 2>$null
    } catch {
        # `kind get clusters` returns a non-zero exit when no clusters exist;
        # catch the error and treat as empty list so the script can create the cluster.
        $clusters = @()
    }

    if ($clusters -notcontains $ClusterName) {
        Write-Host "Creando cluster local de Kubernetes con kind: $ClusterName"
        Invoke-Native kind create cluster --name $ClusterName
    } else {
        Write-Host "Usando cluster existente: $ClusterName"
        if (-not (Test-ClusterReachable)) {
            Write-Host "El cluster existe, pero no responde. Recreandolo..."
            Invoke-Native kind delete cluster --name $ClusterName
            Invoke-Native kind create cluster --name $ClusterName
        }
    }

    # Always target the right context
    Invoke-Native kubectl config use-context "kind-$ClusterName" | Out-Null
    Wait-ClusterReady

    # Apply Namespace
    Invoke-Native kubectl apply -f "$ScriptDir\overlays\local\namespace.yaml" | Out-Null

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
    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo crear o aplicar el secret motormatch-secrets"
    }

    # Build Docker Images
    Write-Host "Construyendo contenedores (Backend y Frontend)..."
    Invoke-Native docker build -t motormatch-backend:latest -f "$RootDir\backend\Dockerfile" "$RootDir\backend" | Out-Null
    Invoke-Native docker build -t motormatch-frontend:latest -f "$RootDir\Frontend\Dockerfile" "$RootDir\Frontend" | Out-Null

    # Load Images to Kind
    Write-Host "Cargando imagenes en el cluster local..."
    Invoke-Native kind load docker-image motormatch-backend:latest motormatch-frontend:latest --name $ClusterName

    # Apply deployments
    Write-Host "Aplicando recursos de k8s (Kustomize)..."
    Invoke-Native kubectl apply -k "$ScriptDir\overlays\local" | Out-Null
    
    # Restart deployments to pick up new images/secrets
    Invoke-Native kubectl rollout restart deployment/backend -n $Namespace | Out-Null
    Invoke-Native kubectl rollout restart deployment/frontend -n $Namespace | Out-Null

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
    Invoke-Native kubectl delete -k "$ScriptDir\overlays\local"
}

function Invoke-Recreate {
    Write-Host "Recreando cluster local de Kubernetes con kind: $ClusterName"
    Invoke-Native kind delete cluster --name $ClusterName
    Invoke-Native kind create cluster --name $ClusterName
    Invoke-Up
}

function Invoke-Status {
    Invoke-Native kubectl get pods,svc,secrets -n $Namespace
}

switch ($Command) {
    "up" { Invoke-Up }
    "down" { Invoke-Down }
    "recreate" { Invoke-Recreate }
    "status" { Invoke-Status }
    default {
        Write-Host "Uso: .\k8s\local.ps1 <up|down|recreate|status>"
        Write-Host ""
        Write-Host "  up      Construye e inicializa todo el cluster (K8s en Windows)"
        Write-Host "  down    Apaga y borra los recursos de K8s"
        Write-Host "  recreate Borra y crea de nuevo el cluster kind local"
        Write-Host "  status  Muestra la salud actual de los Pods"
    }
}
