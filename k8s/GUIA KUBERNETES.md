# MotorMatch Kubernetes Local

Este directorio contiene una base reutilizable y un overlay local para ejecutar MotorMatch en Kubernetes. El objetivo es probar el sistema en un entorno parecido a produccion, pero sin desplegarlo aun en un cluster publico.

## Estructura

- `k8s/base`: recursos compartidos del sistema, como backend y frontend.
- `k8s/overlays/local`: configuracion local, namespace y conexion a la base de datos de Supabase.
- `k8s/local.sh`: script que levanta el entorno local usando el overlay.

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

La opcion recomendada es usar Windows con WSL2 y Ubuntu. Asi puedes ejecutar el script Bash sin adaptaciones y reutilizar la misma guia que en Linux.

1. Instala WSL2 y Ubuntu:

```powershell
wsl --install -d Ubuntu
```

2. Instala Docker Desktop y activa la integracion con WSL2.

3. Abre Ubuntu desde WSL y ejecuta el proyecto desde esa terminal.

4. Dentro de Ubuntu, instala las utilidades base:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release bash
```

5. Instala `kubectl`:

```bash
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --dearmor -o /usr/share/keyrings/kubernetes-apt-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /" | sudo tee /etc/apt/sources.list.d/kubernetes.list >/dev/null
sudo apt update
sudo apt install -y kubectl
```

6. Instala `kind`:

```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

7. Verifica la instalacion:

```bash
docker --version
kubectl version --client
kind version
bash --version
```

### Requisitos funcionales

Antes de ejecutar el despliegue local, confirma lo siguiente:

- Docker esta corriendo y puede construir imagenes.
- `kubectl` puede hablar con un cluster local.
- Bash esta disponible para ejecutar `k8s/local.sh`.
- Si usas kind, el script puede crear un cluster llamado `motormatch-local` automaticamente.
- Debes tener las cadenas reales de Supabase en el archivo `.env` de la raiz del proyecto; el script crea el Secret a partir de ese archivo.

## Como desplegar el sistema

1. Construye las imagenes de backend y frontend, aplica el overlay local y espera a que los recursos queden listos.

```bash
bash k8s/local.sh up
```

2. Cuando el script termine, el frontend quedara expuesto en `http://localhost:8080` mediante `kubectl port-forward`.

3. Si quieres comprobar el estado del entorno, revisa los pods y servicios del namespace `motormatch`.

```bash
bash k8s/local.sh status
```

4. Para ver los logs de un componente concreto, usa el comando de logs del script.

```bash
bash k8s/local.sh logs backend
bash k8s/local.sh logs frontend
```

5. Cuando termines la prueba local, elimina los recursos y detén el port-forward.

```bash
bash k8s/local.sh down
```

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

## Proximos pasos

- Si despues quieres llevar esto a un cluster publico, crea un overlay nuevo sobre `k8s/base` y reutiliza el patron de Supabase o cambia a una base gestionada distinta.