# 🐳 Guía Completa - Docker en MotorMatch

## 📌 Índice
1. [Configuración Inicial](#configuración-inicial)
2. [Comandos del Día a Día](#comandos-del-día-a-día)
3. [Para Desarrolladores](#para-desarrolladores)
4. [Para el Equipo](#para-el-equipo)
5. [Troubleshooting](#troubleshooting)
6. [Deploy a Producción](#deploy-a-producción)

---

## ⚙️ Configuración Inicial

**Esto solo se hace UNA sola vez al clonar el proyecto.**

### Paso 1: Verificar que tienes Docker
```bash
docker --version
docker-compose --version
```

Si no aparece nada, [instala Docker Desktop](https://www.docker.com/products/docker-desktop).

### Paso 2: Clonar el Proyecto
```bash
git clone <URL-del-repositorio>
cd MotorMatch
```

### Paso 3: Crear el archivo .env
```bash
cp .env.example .env
```

### Paso 4: Editar .env con tus credenciales
Abre `.env` y reemplaza:
```env
DATABASE_URL="postgresql://..."     # Tu Supabase (pooler)
DIRECT_URL="postgresql://..."       # Tu Supabase (direct)
JWT_SECRET=...                      # (Puedes dejar el actual)
SMTP_USER=...                       # Tu email (opcional)
SMTP_PASS=...                       # Tu app password (opcional)
```

### Paso 5: ¡Listo! Inicia Docker
```bash
docker-compose up
```

**Espera a que aparezca:**
```
✅ Frontend (Vite)   ready in 179 ms
✅ Backend 🚀 Servidor corriendo en http://localhost:3000
```

---

## 🎯 Comandos del Día a Día

### Para INICIAR el Proyecto

Desde la carpeta raíz del proyecto:

```bash
# Opción 1: Comando Docker directo
docker-compose up

# Opción 2: Usar el script PowerShell (Windows)
.\start.ps1

# Con -d para ejecutar en background (sin ver logs)
docker-compose up -d
```

**¿Qué esperar?**
- Tarda ~30 segundos en la primera vez
- Las siguientes veces arranca en ~5 segundos
- Verás logs de Redux, Vite y Node.js

### Acceder a la Aplicación

Una vez que veas "ready in X ms", abre en el navegador:

```
Frontend:  http://localhost        (Puerto 80 o 5173)
Backend:   http://localhost:3000   (API REST)
Health:    http://localhost:3000/api/health
```

### Ver Logs en Tiempo Real

```bash
# Todos los servicios
docker-compose logs -f

# Solo un servicio
docker-compose logs -f backend    # Backend
docker-compose logs -f frontend   # Frontend
docker-compose logs -f db         # Base de datos

# Últimas 50 líneas
docker-compose logs --tail=50

# Usar el script (Windows)
.\logs.ps1
.\logs.ps1 -service backend
```

### Detener el Proyecto

```bash
# Opción 1: Ctrl+C (si está en foreground)

# Opción 2: En otra terminal
docker-compose down

# Opción 3: Usando script (Windows)
.\stop.ps1
```

### Eliminar TODO (BD, volúmenes, contenedores)

⚠️ **CUIDADO**: Esto elimina la BD local.

```bash
docker-compose down -v

# O con script (Windows)
.\stop.ps1 -clean
```

---

## 💻 Para Desarrolladores

### Cuando Modifiques Código

#### Backend (Node.js)
Los cambios se aplican **automáticamente**:
```
1. Editas un archivo en backend/src
2. Nodemon lo detecta
3. El backend reinicia solo
4. Los cambios están listos en http://localhost:3000
```

**Ejemplo:**
```bash
# Edita backend/src/modules/auth/auth.controller.js
# Espera 1-2 segundos
# El cambio está vivo sin reiniciar

# En logs verás:
# [nodemon] restarting due to changes...
# [INFO] ✅ Servidor corriendo en http://localhost:3000
```

#### Frontend (React + Vite)
Los cambios se aplican **al instante**:
```
1. Editas un archivo en Frontend/src
2. Vite lo detecta
3. El navegador actualiza automáticamente (HMR)
4. Los cambios están listos sin F5
```

**Ejemplo:**
```bash
# Edita Frontend/src/App.jsx
# El navegador se actualiza automáticamente
# En logs verás:
# [vite] ✓ updated in 50ms
```

### Cuando Instales Nuevos Paquetes

#### Backend
```bash
# Instalar un paquete nuevo
docker-compose exec backend npm install axios

# El paquete se instala dentro del contenedor
# y está disponible inmediatamente
```

#### Frontend
```bash
# Instalar un paquete nuevo
docker-compose exec frontend npm install react-query

# El paquete se instala y está listo
```

### Cuando Cambies el Dockerfile

Si editas `backend/Dockerfile`, `Frontend/Dockerfile.dev`, o `Frontend/Dockerfile`:

```bash
# Reconstruir las imágenes
docker-compose down
docker-compose up --build

# O con scripts
.\stop.ps1
.\start.ps1 -build
```

### Ejecutar Comandos dentro de Contenedores

```bash
# Backend
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run import-bikes
docker-compose exec backend npm run db:generate

# Frontend
docker-compose exec frontend npm run build

# Base de datos (Prisma Studio)
docker-compose exec backend npm run db:studio
```

### Ver el Estado de los Contenedores

```bash
docker-compose ps
```

Verás algo como:
```
NAME               STATUS
motormatch-backend  Up 5 minutes
motormatch-frontend Up 5 minutes
motormatch-db       Up 5 minutes (healthy)
```

---

## 👥 Para el Equipo

### Onboarding de un Nuevo Miembro

**Paso 1: Instalación de Docker**
```bash
# Descarga Docker Desktop:
# https://www.docker.com/products/docker-desktop

# Verifica que está instalado
docker --version
```

**Paso 2: Clonar el Proyecto**
```bash
git clone <URL>
cd MotorMatch
```

**Paso 3: Configuración de Entorno**
```bash
cp .env.example .env

# Pedir al Team Lead las credenciales de Supabase
# y agregarlas a .env
```

**Paso 4: Arrancar**
```bash
docker-compose up
```

**¡Listo!** Accede a http://localhost 🎉

### Compartir Cambios en BD

Si hiciste cambios en Prisma schema:

```bash
# 1. Crear migración
docker-compose exec backend npx prisma migrate dev --name nombre_cambio

# 2. El teammate ejecuta
git pull
docker-compose up

# La migración se aplica automáticamente
```

### Sincronizar con el Equipo

```bash
# Traer cambios de otros
git pull origin main

# Si solo cambió código (backend/src, Frontend/src)
# El hot-reload aplica los cambios automáticamente

# Si cambió Dockerfile o docker-compose.yml
docker-compose down
docker-compose up --build
```

---

## 🔧 Troubleshooting

### Problema: "Port 3000 is already in use"

**Causa:** Otro servicio usa puerto 3000.

**Solución:**
```bash
# Opción 1: Detener Docker
docker-compose down

# Opción 2: Cambiar puerto en docker-compose.yml
# Cambia: ports: ["3000:3000"]
# Por:    ports: ["3001:3000"]
# Accede a http://localhost:3001
```

### Problema: Frontend o Backend crashea

**Solución:**
```bash
# Ver los logs
docker-compose logs backend
docker-compose logs frontend

# Reiniciar un servicio
docker-compose restart backend

# Reconstruir todo
docker-compose down -v
docker-compose up --build
```

### Problema: Base de Datos no conecta

**Verificar credenciales:**
```bash
# 1. Abre .env
# 2. Verifica que DATABASE_URL y DIRECT_URL son correctos
# 3. Deben ser de Supabase (no localhost)

# Si están correctas pero sigue sin funcionar:
docker-compose exec backend npm run db:generate
docker-compose exec backend npm run db:migrate
```

### Problema: "npm: not found" en contenedor

**Solución:**
```bash
# Reconstruir desde cero
docker-compose down -v
rm -rf backend/node_modules Frontend/node_modules
docker-compose up --build
```

### Problema: Cambios no se ven en Frontend

Si editas código pero no ves cambios:
```bash
# 1. Verifica logs
docker-compose logs frontend

# 2. Si el HMR no funciona, reconstruye
docker-compose down
docker-compose up --build

# 3. Limpia caché del navegador (Ctrl+Shift+Del)
```

### Problema: Contenedores consumen mucha memoria

```bash
# Ver uso de recursos
docker stats

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar volúmenes no usados
docker volume prune
```

---

## 🚀 Deploy a Producción

### Pre-requisitos
- Servidor Linux (AWS, DigitalOcean, Railway, etc.)
- Docker y Docker Compose instalados
- Dominio para tu aplicación

### Paso 1: Preparar Producción

En tu servidor:
```bash
git clone <URL>
cd MotorMatch

# Crear .env con credenciales
cp .env.example .env
# Editar .env con valores de producción
```

### Paso 2: Usar Configuración de Producción

```bash
# Usar docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d

# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Paso 3: Configurar Dominio (opcional)

Si tienes un dominio, coloca Nginx frente:
```
Cliente -> Nginx (puerto 80/443) -> Docker

# Certificado SSL automático con Let's Encrypt
```

### Paso 4: Monitorear

```bash
# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Resetear BD (destructivo)
docker-compose -f docker-compose.prod.yml down -v
```

---

## 📚 Referencia Rápida de Comandos

| Comando | Función |
|---------|---------|
| `docker-compose up` | Inicia todo |
| `docker-compose down` | Detiene todo |
| `docker-compose logs -f` | Ver logs |
| `docker-compose ps` | Ver estado |
| `docker-compose exec backend npm run db:migrate` | Migraciones |
| `docker-compose restart backend` | Reinicia un servicio |
| `docker-compose up --build` | Reconstruir imágenes |
| `docker-compose down -v` | Eliminar todo incluyendo BD |

---

## 🎓 Videos/Links Útiles

- [Docker Basics](https://docs.docker.com/get-started/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Vite HMR](https://vitejs.dev/guide/features.html#hot-module-replacement)

---

## ❓ Preguntas Frecuentes

**P: ¿Necesito instalar Node.js localmente?**
R: No, Docker lo incluye. Solo necesitas Docker Desktop.

**P: ¿Puedo desarrollar sin Docker?**
R: Sí, pero todos en el equipo deben instalar Node, npm, PostgreSQL, etc. Docker lo hace más consistente.

**P: ¿Cómo agrego una variable de entorno?**
R: 
1. Agrega a `.env.example` con descripción
2. Agrega a `.env` con el valor
3. Usa en el código: `process.env.TU_VARIABLE`

**P: ¿Qué pasa si elimino un contenedor?**
R: Se pierde todo dentro (BD, dependencias). Ejecuta `docker-compose up --build` para reconstruir.

**P: ¿Puedo hacer push a un registro Docker (Docker Hub)?**
R: Sí, pero no es necesario para desarrollo. Solo necesario para production distribución.

---

## 🆘 ¿Algo no funciona?

1. Lee los logs: `docker-compose logs -f`
2. Busca el error en Google + "Docker"
3. Prueba eliminar todo y reconstruir: `docker-compose down -v && docker-compose up --build`
4. Pide ayuda al equipo con los logs

---

**¡Buena suerte desenvolviendo! 🚀**
