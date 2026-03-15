⚡ QUICK START - MotorMatch con Docker
=====================================

## 🚀 PRIMERA VEZ

1. Instala Docker Desktop: https://docker.com/products/docker-desktop
2. Abre PowerShell en la carpeta del proyecto
3. Copia configuración:
   ```
   cp .env.example .env
   ```
4. Edita `.env` con tus credenciales de Supabase
5. Inicia:
   ```
   docker-compose up
   ```

## 📍 Accede a la Aplicación

```
Frontend:  http://localhost
Backend:   http://localhost:3000
Health:    http://localhost:3000/api/health
```

## 🎯 CADA VEZ QUE DESARROLLES

### Iniciar
```bash
docker-compose up
# O con script:
.\start.ps1
```

### Ver Logs
```bash
docker-compose logs -f backend
# O con script:
.\logs.ps1
```

### Detener
```bash
docker-compose down
# O con script:
.\stop.ps1
```

## ⚡ LO IMPORTANTE

✅ **Backend**: Los cambios en `backend/src/` se aplican automáticamente (nodemon)
✅ **Frontend**: Los cambios en `Frontend/src/` se ven al instante sin F5 (Vite HMR)
✅ **BD**: Usa Supabase online, no local

## 📋 COMMANDOS ÚTILES

| Lo que quieres | Comando |
|---|---|
| Ver logs del backend | `docker-compose logs -f backend` |
| Ver logs del frontend | `docker-compose logs -f frontend` |
| Instalar paquete en backend | `docker-compose exec backend npm install axios` |
| Ejecutar migraciones | `docker-compose exec backend npm run db:migrate` |
| Importar motos | `docker-compose exec backend npm run import-bikes` |
| Ver BD visualmente | `docker-compose exec backend npm run db:studio` |
| Reconstruir todo | `docker-compose down && docker-compose up --build` |
| Limpiar todo | `docker-compose down -v` |

## 🆘 SI ALGO FALLA

```bash
# Paso 1: Ver los logs
docker-compose logs -f

# Paso 2: Si no sirve, reinicia
docker-compose down
docker-compose up --build

# Paso 3: Si sigue fallando, limpia todo
docker-compose down -v
docker-compose up --build
```

## 📚 MÁS INFORMACIÓN

Lee la guía completa: `GUIA_DOCKER.md`

---

**TL;DR:**
```bash
docker-compose up       # Inicia
docker-compose logs -f  # Ve qué pasa
docker-compose down     # Para
```

¡Listo! 🚀
