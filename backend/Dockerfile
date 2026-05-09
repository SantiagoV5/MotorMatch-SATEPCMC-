FROM node:20-slim

RUN apt-get update && apt-get install -y openssl wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY package*.json ./

# npm ci en lugar de npm install:
# - Lee package-lock.json exactamente, sin resolución de dependencias → mucho menos RAM
# - Reproducible y más rápido: ideal para CI/CD (Render, GitHub Actions, etc.)
# - Requiere que package-lock.json exista en el repo (ya está incluido)
RUN npm ci

COPY . .

# Usa el Prisma instalado localmente por npm ci (versión 5.x del package.json).
# NO se usa "npx prisma generate" porque npx descarga la última versión de npm
# (actualmente Prisma 7, incompatible con este proyecto).
# Las URLs placeholder solo existen para satisfacer la validación de env vars
# que Prisma 5 hace al leer el schema — no se conecta a ninguna BD en este paso.
# Las URLs reales las inyecta Render en tiempo de ejecución.
RUN DATABASE_URL="postgresql://user:pass@localhost:5432/motormatch" \
    DIRECT_URL="postgresql://user:pass@localhost:5432/motormatch" \
    node_modules/.bin/prisma generate

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Se ejecuta "node" directamente en lugar de "npm start" para evitar el hook
# prestart del package.json, que intenta cargar "../.env" con dotenv-cli.
# Ese archivo no existe en el contenedor de Render (las variables las inyecta
# Render directamente en el entorno del proceso, sin archivos .env).
CMD ["node", "src/server.js"]
