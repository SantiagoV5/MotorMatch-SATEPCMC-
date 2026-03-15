# MotorMatch 🏍️

[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-lightblue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue)](https://www.docker.com/)

Sistema de asesoría técnica y económica para la compra de motocicletas en Colombia.

El usuario responde un cuestionario (presupuesto, uso, características físicas) y el sistema le recomienda las motos más adecuadas, con posibilidad de compararlas entre sí.

---

## 🚀 Inicio Rápido con Docker

La forma más fácil es usar Docker - **no necesitas instalar nada localmente**:

```bash
# 1. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# 2. Asegúrate que Docker Desktop está corriendo

# 3. Inicia todo (backend, frontend, DB)
docker-compose up

# 4. Accede a la aplicación
# Frontend: http://localhost
# Backend API: http://localhost:3000/api
```

**¡Eso es todo!** Los cambios en el código se reflejan automáticamente.

### 📚 Documentación

- **[QUICKSTART.md](QUICKSTART.md)** - Guía rápida (⭐ Empieza aquí)
- **[GUIA_DOCKER.md](GUIA_DOCKER.md)** - Guía completa con todos los detalles
- [Prisma ORM](https://www.prisma.io/docs/) - Base de datos
- [Express.js](https://expressjs.com/) - Backend
- [React](https://react.dev/) - Frontend
- [Docker](https://docs.docker.com/) - Containerización

---

## Stack Tecnológico

| Capa | Tecnología | Descripción |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA moderna con HMR en desarrollo |
| **Backend** | Node.js 20 + Express | API RESTful con autenticación JWT |
| **Database** | PostgreSQL (Supabase) | ORM: Prisma |
| **Auth** | bcryptjs + JWT | Seguridad de contraseñas y sesiones |
| **DevOps** | Docker + Docker Compose | Containerización y orquestación |

---

## 📦 Estructura del Proyecto

```
MotorMatch/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma           # Modelos de BD (User, Motorcycle, etc)
│   ├── scripts/
│   │   ├── importBikes.js          # Importación desde CSV
│   │   ├── enrichBike.js           # Enriquecimiento de datos
│   │   └── updatePrices.js         # Actualización de precios
│   ├── src/
│   │   ├── config/                 # Configuraciónde DB y env
│   │   ├── middlewares/            # Auth JWT, errores, validación
│   │   ├── modules/                # Módulos (auth, motorcycles, etc)
│   │   └── utils/                  # Utilities, logger, mailer
│   ├── Dockerfile                  # Docker para backend
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── features/               # Módulos (auth, motorcycles, etc)
│   │   ├── pages/                  # Páginas principales
│   │   ├── shared/                 # Componentes y hooks reutilizables
│   │   └── App.jsx
│   ├── Dockerfile                  # Docker multi-stage
│   ├── nginx.conf                  # Configuración Nginx
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml              # Desarrollo (con hot-reload)
├── docker-compose.prod.yml         # Producción (optimizado)
├── .env.example                    # Template de configuración
└── README.md                       # Este archivo
```

---

## 📋 Comandos Docker Principales

### Desarrollo

```bash
# Iniciar todo
docker-compose up

# Ver logs en tiempo real
docker-compose logs -f

# Detener todo
docker-compose down

# Reconstruir después de cambios importante (Dockerfile)
docker-compose up --build
```

### Ejecutar Comandos

```bash
# Migraciones de BD
docker-compose exec backend npm run db:migrate

# Popular BD con motos
docker-compose exec backend npm run import-bikes

# Abrir Prisma Studio (BD visual)
docker-compose exec backend npm run db:studio
```

### Producción

```bash
# Usar configuración de producción
docker-compose -f docker-compose.prod.yml up -d

# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Detener
docker-compose -f docker-compose.prod.yml down
```

---

## ⚙️ Configuración sin Docker (Local)

Si prefieres desarrollo local sin Docker:

### Backend

```bash
cd backend
cp .env.example .env
# Edita .env con credenciales reales

npm install
npm run db:migrate
npm run import-bikes
npm run dev  # Inicia en http://localhost:3000
```

### Frontend

```bash
cd Frontend
npm install
npm run dev  # Inicia en http://localhost:5173
```

---

## 🔐 Seguridad

- **Contraseñas**: Hasheadas con bcryptjs (factor 12)
- **Sesiones**: JWT con HS256, expiración configurable
- **Variables sensibles**: En `.env` (nunca en Git)
- **CORS**: Configurado para frontend en `docker-compose.yml`

---

## 📝 Variables de Entorno (.env)

Ver [.env.example](.env.example) para lista completa. Las principales:

```bash
NODE_ENV=development
DATABASE_URL="postgresql://..."      # Supabase
DIRECT_URL="postgresql://..."        # Supabase (migraciones)
JWT_SECRET=tu_secreto_largo_aqui
FRONTEND_URL=http://localhost
SMTP_HOST=smtp.gmail.com              # Email (opcional)
SMTP_PASS=tu_app_password
```

---

## 🛠️ Scripts Disponibles

### Backend

| Script | Descripción |
|---|---|
| `npm run dev` | Desarrollo con nodemon |
| `npm start` | Producción |
| `npm run db:migrate` | Aplicar migraciones |
| `npm run db:generate` | Regenerar Prisma |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run import-bikes` | Importar motos desde CSV |
| `npm run enrich-bikes` | Enriquecer datos de motos |

### Frontend

| Script | Descripción |
|---|---|
| `npm run dev` | Développement avec Vite HMR |
| `npm run build` | Build para producción |
| `npm run preview` | Preview del build |

---

## 🐛 Troubleshooting

**Los contenedores no inician:**
```bash
docker-compose down -v
docker-compose up --build
```

**Error de conexión a Supabase:**
- Verifica `DATABASE_URL` y `DIRECT_URL` en `.env`
- Comprueba que son URLs válidas y accesibles

**Frontend no ve cambios después de editar:**
```bash
# En Docker, frontend se compila. Reconstruye:
docker-compose down
docker-compose up --build
```

**Backend crashea por Prisma:**
```bash
docker-compose exec backend npm run db:generate
```

---

## 📚 Documentación

- [Prisma ORM](https://www.prisma.io/docs/) - Base de datos
- [Express.js](https://expressjs.com/) - Backend
- [React](https://react.dev/) - Frontend
- [Docker](https://docs.docker.com/) - Containerización
- [Supabase](https://supabase.com/docs) - PostgreSQL en la nube

---

## 👥 Equipo

Desarrollado como parte del bootcamp de desarrollo web.

---

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE)
