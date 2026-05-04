# Despliegue

[Volver al indice](../README.md)

## Resumen de infraestructura

MotorMatch puede ejecutarse de tres formas:

- Local sin Docker: backend y frontend con npm.
- Docker Compose: `docker-compose.yml` para desarrollo y `docker-compose.prod.yml` para produccion.
- Kubernetes: manifests en `k8s/base` y overlay local en `k8s/overlays/local`.

## Variables de entorno

Variables reales usadas por el proyecto:

| Variable | Uso |
| --- | --- |
| `NODE_ENV` | entorno de ejecucion |
| `PORT` | puerto backend, default esperado 3000 |
| `DATABASE_URL` | conexion Prisma runtime, Supabase pooler recomendado |
| `DIRECT_URL` | conexion directa para migraciones Prisma |
| `JWT_SECRET` | firma JWT |
| `JWT_EXPIRES_IN` | expiracion JWT |
| `FRONTEND_URL` | CORS en produccion |
| `APP_URL` | links de email |
| `SMTP_HOST` | servidor SMTP |
| `SMTP_PORT` | puerto SMTP |
| `SMTP_USER` | usuario SMTP |
| `SMTP_PASS` | password/app password SMTP |
| `POSTGRES_PASSWORD` | password para PostgreSQL local en Docker |
| `PRICE_ALERT_CRON` | cron opcional para alertas de precio |
| `VITE_API_URL` | target proxy de Vite en desarrollo |

## Backend

### Build e inicio

Local:

```bash
cd backend
npm install
npm run db:generate
npm start
```

Desarrollo:

```bash
npm run dev
```

Produccion con migraciones versionadas:

```bash
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm start
```

> TODO: actualmente no se encontro `backend/prisma/migrations`. Para despliegue formal se debe crear y versionar la carpeta de migraciones.

### Cron jobs

El cron de alertas se inicia dentro del backend en `src/server.js`.

Consideracion importante:

- En una sola instancia funciona correctamente.
- En multiples replicas, cada replica iniciaria el cron y podria duplicar trabajo.

Recomendacion para produccion:

- Ejecutar el worker como proceso independiente.
- O usar un scheduler externo.
- O usar colas tipo BullMQ/Redis con locking.

### Logs

En desarrollo, Morgan registra requests HTTP. El logger interno esta en `backend/src/utils/logger.js`.

Docker:

```bash
docker compose logs -f backend
```

Windows:

```powershell
.\logs.ps1 -service backend
```

### PM2 o alternativa

Para servidor VM sin Docker:

```bash
npm install -g pm2
cd backend
pm2 start src/server.js --name motormatch-backend
pm2 save
pm2 startup
```

Variables:

- Cargar `.env` con el entorno del sistema o usar ecosystem file.
- No commitear secrets.

Alternativas:

- Docker con restart policy.
- Systemd.
- Plataforma PaaS.

## Frontend

### Build de produccion

```bash
cd Frontend
npm ci
npm run build
```

El build queda en `Frontend/dist`.

### Hosting

Opciones:

- Nginx con `Frontend/nginx.conf`.
- Docker multi-stage con `Frontend/Dockerfile`.
- Hosting estatico compatible con SPA.

Nginx real:

- Sirve `index.html`.
- Usa `try_files` para SPA.
- Proxy `/api/` a `http://backend:3000/api/`.
- Cachea assets estaticos con hash.
- Habilita gzip.

### Variables Vite

En desarrollo, `VITE_API_URL` controla el proxy de Vite.

Ejemplo:

```env
VITE_API_URL=http://localhost:3000
```

El cliente Axios usa `baseURL: '/api'`.

## Base de datos: PostgreSQL/Supabase

### Configuracion

Usa:

- `DATABASE_URL`: pooler Supabase para runtime.
- `DIRECT_URL`: conexion directa para migraciones.

Recomendaciones:

- Activar SSL.
- Restringir acceso por secrets.
- Separar base de datos de desarrollo, staging y produccion.

### Backups

Supabase:

- Activar backups automaticos segun plan.
- Exportar antes de migraciones grandes.
- Probar restauracion periodicamente.

PostgreSQL local:

```bash
pg_dump "$DATABASE_URL" > backup.sql
```

Restauracion:

```bash
psql "$DATABASE_URL" < backup.sql
```

### Migraciones

Desarrollo:

```bash
cd backend
npm run db:migrate
```

Produccion:

```bash
npx prisma migrate deploy
```

TODO:

- Crear migraciones versionadas.
- Evitar `migrate dev` en produccion.

## Docker Compose

### Desarrollo

Archivo: `docker-compose.yml`

Servicios:

- `backend`: Node/Express con `npm run dev`.
- `frontend`: Vite con hot reload.
- `db`: PostgreSQL local opcional.

Comandos:

```bash
docker compose up --build
docker compose logs -f
docker compose down
```

Windows:

```powershell
.\start.ps1 -build
.\logs.ps1
.\stop.ps1
```

### Produccion

Archivo: `docker-compose.prod.yml`

Servicios:

- `backend`: `npm start`, healthcheck `/api/health`.
- `frontend`: Nginx en puertos 80 y 443.
- Base de datos externa: Supabase.

Comando:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## Kubernetes

Archivos reales:

- `k8s/base/backend-deployment.yaml`
- `k8s/base/backend-service.yaml`
- `k8s/base/frontend-deployment.yaml`
- `k8s/base/frontend-service.yaml`
- `k8s/base/kustomization.yaml`
- `k8s/overlays/local/configmap.yaml`
- `k8s/overlays/local/kustomization.yaml`
- `k8s/overlays/local/namespace.yaml`
- `k8s/local.ps1`
- `k8s/local.sh`

El backend usa:

- 2 replicas.
- Probes contra `/api/health`.
- `envFrom` con ConfigMap `motormatch-config` y Secret `motormatch-secrets`.
- Requests/limits de CPU/memoria.

El frontend usa:

- 2 replicas.
- Probes contra `/`.
- Nginx en puerto 80.

Aplicacion local:

```bash
kubectl apply -k k8s/overlays/local
```

Ver recursos:

```bash
kubectl get pods -n motormatch
kubectl get svc -n motormatch
```

TODO:

- Agregar manifiesto de Secret documentado o script seguro para crearlo.
- Definir Ingress con TLS.
- Separar worker de alertas si se usan replicas.

## CI/CD basico

No se encontro `.github/workflows` en el repo. Propuesta inicial:

```yaml
name: ci

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: |
            backend/package-lock.json
            Frontend/package-lock.json
      - name: Backend install
        working-directory: backend
        run: npm ci
      - name: Prisma generate
        working-directory: backend
        run: npx prisma generate
      - name: Frontend install
        working-directory: Frontend
        run: npm ci
      - name: Frontend build
        working-directory: Frontend
        run: npm run build
```

TODO:

- Agregar tests reales antes de exigirlos en CI.
- Agregar build de imagenes Docker.
- Agregar despliegue a ambiente staging.

## Seguridad

Recomendaciones minimas:

- Usar HTTPS siempre en produccion.
- Guardar secrets en Secret Manager, variables del proveedor o Kubernetes Secrets.
- Rotar `JWT_SECRET` si se filtra.
- Configurar CORS con dominio real mediante `FRONTEND_URL`.
- Agregar rate limiting a rutas sensibles:
  - `/api/auth/login`
  - `/api/auth/forgot-password`
  - `/api/auth/resend-verification`
  - `/api/support`
- Agregar Helmet para headers HTTP.
- Validar tamano maximo de JSON.
- No exponer `.env`.
- Revisar logs para no imprimir tokens reales.

## Checklist pre-despliegue

- [ ] `.env` completo en el entorno destino.
- [ ] `DATABASE_URL` y `DIRECT_URL` validados.
- [ ] `JWT_SECRET` seguro.
- [ ] SMTP probado o fallback entendido.
- [ ] `FRONTEND_URL` y `APP_URL` apuntan al dominio real.
- [ ] Migraciones Prisma versionadas.
- [ ] `npx prisma migrate deploy` probado en staging.
- [ ] `npm run build` frontend exitoso.
- [ ] Health check `/api/health` responde.
- [ ] HTTPS configurado.
- [ ] Logs accesibles.
- [ ] Backups de base de datos activos.
- [ ] Cron de alertas no se duplica con replicas.

## Checklist QA

- [ ] Registro de usuario.
- [ ] Verificacion por email.
- [ ] Login y logout.
- [ ] Recuperacion de contrasena.
- [ ] Catalogo con filtros.
- [ ] Detalle de moto.
- [ ] Cuestionario completo.
- [ ] Recomendaciones generadas.
- [ ] Favoritos agregar/eliminar.
- [ ] Comparacion de 2 motos.
- [ ] Comparacion de 3 motos.
- [ ] Historial de comparaciones.
- [ ] Simulador de costos.
- [ ] Historial de simulaciones.
- [ ] Alertas de precio crear/pausar/reactivar/eliminar.
- [ ] Historial de notificaciones.
- [ ] Perfil actualizar.
- [ ] Soporte envia correo.
- [ ] Vista mobile y desktop.
