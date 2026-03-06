# MotorMatch 🏍️
Sistema de asesoría técnica y económica para la compra de motocicletas en Colombia.

El usuario responde un cuestionario (presupuesto, uso, características físicas) y el sistema le recomienda las motos más adecuadas, con posibilidad de compararlas entre sí.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL (via Prisma ORM) |
| Autenticación | Propia — bcryptjs + JWT (jsonwebtoken) |
| Fuente de datos | CSV de datos.gov.co |

---

## Estructura del proyecto

```
MotorMatch/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Modelos: User, Motorcycle, SavedResult
│   ├── scripts/
│   │   ├── importBikes.js       # Carga CSV → PostgreSQL
│   │   ├── enrichBike.js        # Enriquece motos con precios/datos estimados
│   │   └── updatePrices.js      # Actualización periódica de precios
│   └── src/
│       ├── config/
│       │   ├── database.js      # Instancia de PrismaClient
│       │   └── environment.js   # Variables de entorno validadas
│       ├── middlewares/         # Auth JWT, errores, validación
│       └── modules/
│           ├── auth/            # Registro, login, tokens JWT
│           ├── motorcycles/     # CRUD + enriquecimiento de motos
│           ├── questionnaire/   # Lógica del cuestionario
│           ├── recommendations/ # Algoritmo de recomendación
│           └── users/           # Perfil y resultados guardados
└── Frontend/
    └── src/
        └── features/
            ├── auth/            # Login / Registro
            ├── motorcycles/     # Catálogo y detalle
            ├── questionnaire/   # Wizard de 3 pasos
            ├── recommendations/ # Lista de recomendaciones con score
            ├── comparison/      # Tabla comparativa de motos
            └── filters/         # Filtros por precio, CC, etc.
```

---

## Configuración inicial (Backend)

### 1. Requisitos previos
- Node.js v18+
- PostgreSQL (local, [Supabase](https://supabase.com), [Railway](https://railway.app) o [Neon](https://neon.tech))

### 2. Variables de entorno
```bash
cd backend
cp .env.example .env
# Editar .env con los valores reales
```

Generar un `JWT_SECRET` seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Crear tablas en la base de datos
```bash
npm run db:migrate
```

### 5. Popular la base de datos con motos
```bash
npm run import-bikes   # Importa desde scripts/data/motosColombia.csv
npm run enrich-bikes   # Agrega precios, consumo, altura de asiento, etc.
```

### 6. Iniciar el servidor
```bash
npm run dev   # Desarrollo (nodemon)
npm start     # Producción
```

---

## Seguridad de la autenticación

- Las contraseñas se almacenan **hasheadas con bcryptjs** (factor de coste 12), nunca en texto plano.
- Las sesiones se manejan con **JWT firmados con HS256** y expiración configurable (`JWT_EXPIRES_IN`).
- El `JWT_SECRET` **nunca** debe subirse al repositorio (está en `.gitignore`).
- Las rutas de catálogo y recomendaciones son **públicas** (no requieren login).
- Solo guardar resultados y acceder al perfil requiere **token JWT válido**.

---

## Scripts disponibles (Backend)

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor en modo desarrollo con recarga automática |
| `npm start` | Servidor en modo producción |
| `npm run import-bikes` | Importa motos desde CSV a PostgreSQL |
| `npm run enrich-bikes` | Enriquece motos con datos estimados |
| `npm run update-prices` | Actualiza precios en la BD |
| `npm run db:migrate` | Crea/actualiza tablas en PostgreSQL |
| `npm run db:generate` | Regenera el cliente de Prisma |
| `npm run db:studio` | Abre Prisma Studio (UI visual de la BD) |
