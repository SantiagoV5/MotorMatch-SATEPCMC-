# 📋 CHEAT SHEET - Comandos Docker MotorMatch

## INICIO DEL PROYECTO

```bash
# Primera vez (setup)
cp .env.example .env
# Editar .env con credenciales

# Cada vez que quieras desarrollar
docker-compose up

# En otra terminal para ver logs
docker-compose logs -f
```

---

## DESARROLLO

### Backend (Node.js)
```bash
# Los cambios en backend/src/* se aplican automáticamente

# Si necesitas instalar un paquete
docker-compose exec backend npm install nombre-paquete

# Ejecutar scripts
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run import-bikes
docker-compose exec backend npm run db:generate
```

### Frontend (React + Vite)
```bash
# Los cambios en Frontend/src/* se ven al instante

# Instalar paquete
docker-compose exec frontend npm install nombre-paquete

# Build para producción
docker-compose exec frontend npm run build
```

### Base de Datos
```bash
# Abrir Prisma Studio (interfaz visual)
docker-compose exec backend npm run db:studio

# Ejecutar migraciones
docker-compose exec backend npm run db:migrate

# Importar datos de motos
docker-compose exec backend npm run import-bikes
```

---

## ESTADO & LOGS

```bash
# Ver estado de contenedores
docker-compose ps

# Ver todos los logs (con -f para seguir en directo)
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Últimas N líneas
docker-compose logs --tail=50
```

---

## PARAR & LIMPIAR

```bash
# Pausar (mantiene datos)
docker-compose down

# Eliminar TODO (⚠️ incluye BD)
docker-compose down -v

# Reiniciar un servicio
docker-compose restart backend

# Reconstruir imágenes
docker-compose up --build

# PowerShell Scripts
.\start.ps1              # Inicia
.\stop.ps1               # Para
.\stop.ps1 -clean        # Para y limpia BD
.\logs.ps1               # Ve logs
.\logs.ps1 -service backend  # Logs del backend
.\migrate.ps1            # Ejecuta migraciones
.\prisma-studio.ps1      # Abre Prisma Studio
```

---

## URLS DE ACCESO

```
Frontend:       http://localhost        (o http://localhost:5173)
Backend API:    http://localhost:3000   (o http://localhost:3000/api)
Health Check:   http://localhost:3000/api/health
Database:       localhost:5432 (external: Supabase)
Prisma Studio: http://localhost:5555 (cuando ejecutas .\prisma-studio.ps1)
```

---

## PROBLEMAS COMUNES

| Problema | Solución |
|----------|----------|
| Puerto ocupado | `docker-compose down` |
| Backend crashea | `docker-compose logs backend` (ver error) |
| Frontend no actualiza | `Ctrl+Shift+R` (hard refresh) o reconstruir |
| BD no conecta | Verificar `.env` DATABASE_URL y DIRECT_URL |
| npm: not found | `docker-compose down -v && docker-compose up --build` |
| Cambios no se ven | Esperar 2-3 segundos (hot-reload tarda) |

---

## FLUJO TÍPICO DE DESARROLLO

```bash
# 1. Terminal 1 - Iniciar Docker
docker-compose up

# 2. Esperar a que esté listo (~30 seg)
# ✓ Frontend ready
# ✓ Backend running
# ✓ Database healthy

# 3. Terminal 2 (opcional) - Ver logs
docker-compose logs -f

# 4. Abre navegador
# Frontend: http://localhost

# 5. Edita código
# - backend/src/* → reinicia automático
# - Frontend/src/* → actualiza automático

# 6. Cuando termines
docker-compose down
```

---

## PARA EL EQUIPO

```bash
# Nuevo miembro:
git clone <URL>
cd MotorMatch
cp .env.example .env
# (pedir credenciales al team lead)
docker-compose up

# Sincronizar cambios:
git pull
docker-compose up

# Si cambió Dockerfile o docker-compose.yml:
docker-compose down
docker-compose up --build
```

---

## PRODUCCIÓN

```bash
# Usar configuración de producción
docker-compose -f docker-compose.prod.yml up -d

# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Parar
docker-compose -f docker-compose.prod.yml down
```

---

## VARIABLES IMPORTANTES EN .env

```bash
NODE_ENV=development

# Supabase (obtener de https://supabase.com)
DATABASE_URL="postgresql://..."       # Puerto 6543 (pooler)
DIRECT_URL="postgresql://..."         # Puerto 5432 (direct)

# JWT
JWT_SECRET=tu_secreto_aqui

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
```

---

**💡 TIP**: Imprime esta hoja o téngala a mano. Son los comandos que usarás todos los días.

**📚 Para más detalles**: Lee `GUIA_DOCKER.md` o `QUICKSTART.md`
