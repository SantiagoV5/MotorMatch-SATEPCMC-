# MotorMatch Kubernetes Local

Este directorio contiene una base reutilizable y un overlay local para ejecutar MotorMatch en Kubernetes. El objetivo es probar el sistema en un entorno parecido a produccion, pero sin desplegarlo aun en un cluster publico.

## Estructura

- `k8s/base`: recursos compartidos del sistema, como backend y frontend.
- `k8s/overlays/local`: configuracion local, namespace y conexion a la base de datos de Supabase.
- `k8s/local.sh`: script que levanta el entorno local usando el overlay (para sistemas Linux/Mac).
- `k8s/local.ps1`: script de PowerShell equivalente diseñado para Windows nativo sin necesidad de WSL.

## Instalacion de dependencias

La ruta mas simple para este proyecto es tener Docker, `kubectl`, `kind` y Bash disponibles. El script `k8s/local.sh` usa esas herramientas para construir las imagenes, crear un cluster local cuando hace falta y aplicar el overlay.

### Linux

En Linux, la forma mas practica es instalar Docker, `kubectl` y `kind` con tu terminal.

En Ubuntu o Debian:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release bash
```

Instala Docker Engine con la guia oficial de Docker para tu distribucion, o usa Docker Desktop para Linux si prefieres una instalacion grafica.

Instala `kubectl`:

```bash
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --dearmor -o /usr/share/keyrings/kubernetes-apt-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /" | sudo tee /etc/apt/sources.list.d/kubernetes.list >/dev/null
sudo apt update
sudo apt install -y kubectl
```

Instala `kind`:

```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

Verifica que todo quedo listo:

```bash
docker --version
kubectl version --client
kind version
bash --version
```

### Windows

La opcion recomendada es usar PowerShell de forma nativa con Docker Desktop y el script `local.ps1`. Estar atado a WSL2 puede generar problemas de lectura en archivos .env e incongruencias en red con el contenedor.

1. Instala [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recomendado) y asegúrate de que el motor 'Docker daemon' esté ejecutándose y visible en tu bandeja del sistema.

2. En vez de WSL2, abre PowerShell como Administrador y descarga las dependencias nativas para Windows usando Winget:

```powershell
winget install Kubernetes.kind
winget install Kubernetes.cli
```

3. Verifica que instalaste las versiones correctas:

```powershell
docker --version
kubectl version --client
kind version
```

### Requisitos funcionales

Antes de ejecutar el despliegue local, confirma lo siguiente:

- Docker esta corriendo y puede construir imagenes.
- `kubectl` debe estar en el PATH (`winget` en Win lo asegura).
- El respectivo script (`k8s/local.sh` para *Unix y `k8s/local.ps1` para PowerShell) debe ser tu punto de entrada para evitar comandos manuales y configuraciones complejas.
- El script creara un cluster de kind llamado `motormatch-local` automaticamente.
- Debes tener las cadenas reales de Supabase en el archivo `.env` de la raiz del proyecto; el script leera las variables para generar el Secret en el cluster.

## Como desplegar el sistema

1. Construye las imagenes de backend y frontend, aplica el overlay local y espera a que los recursos queden listos.

*En Bash (Mac/Linux):*
`bash
bash k8s/local.sh up
`

*En PowerShell (Windows):*
`powershell
.\k8s\local.ps1 up
`

2. Cuando el script termine, el frontend debe exponerse localmente por terminal con este tunel para permitir acceso:

`bash
kubectl port-forward svc/frontend 8080:80 -n motormatch
`
(Tras lanzar el puerto, podras entrar a `http://localhost:8080`)

3. Si quieres comprobar el estado de salud de tus contenedores.

*En Bash:*
`bash
bash k8s/local.sh status
`

*En PowerShell:*
`powershell
.\k8s\local.ps1 status
`

4. Cuando termines la prueba local, elimina los recursos y mata el proceso de tunneling.

*En Bash:*
`bash
bash k8s/local.sh down
`

*En PowerShell:*
`powershell
.\k8s\local.ps1 down
`
## Comandos utilizados

Estos son los comandos principales que usa este flujo local:

```bash
docker --version
kubectl version --client
kind version
docker build -t motormatch-backend:latest -f backend/Dockerfile backend
docker build -t motormatch-frontend:latest -f Frontend/Dockerfile Frontend
kubectl apply -k k8s/overlays/local
kubectl port-forward -n motormatch svc/frontend 8080:80
kubectl get pods,svc -n motormatch
kubectl logs -n motormatch -f deployment/backend
kubectl delete -k k8s/overlays/local
```

El script `k8s/local.sh` agrupa esos pasos para que no tengas que ejecutarlos manualmente uno por uno.

## Notas del entorno local

- La base de datos sigue viviendo en Supabase; el cluster local solo ejecuta backend y frontend.
- El script toma `DATABASE_URL`, `DIRECT_URL` y `JWT_SECRET` desde el `.env` de la raiz y crea el Secret en el cluster.
- El frontend no usa `Ingress` en este flujo local; se accede por `port-forward`.
- Este overlay no despliega un job de migraciones ni una base local; solo consume la base de datos remota.