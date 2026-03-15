# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile para Backend (Node.js + Express)
# ─────────────────────────────────────────────────────────────────────────────

# Usa Node.js 20 con Alpine Linux (muy ligero: ~150MB vs 400MB de versión normal)
FROM node:20-alpine

# Instala dependencias del sistema necesarias para Prisma
RUN apk add --no-cache openssl libressl python3 make g++

# Define el directorio de trabajo dentro del contenedor
WORKDIR /app/backend

# Copia package.json
COPY package.json ./

# NO copiar package-lock.json para que npm install lo regenere (soluciona compilación de Prisma)
# Instala dependencias - npm install en lugar de npm ci para permitir regeneración
RUN npm install --legacy-peer-deps

# AHORA copia el package-lock.json (que se habrá generado)
# (si quieres, pero no es necesario para el funcionamiento)

# Copia todo el código
COPY . .

# Genera el cliente de Prisma específico para Linux
RUN npx prisma generate

# Copia todo el código de la aplicación
COPY . .

# Genera cliente de Prisma (necesario para que funcione)
RUN npx prisma generate

# Expone el puerto que usa el backend
EXPOSE 3000

# Comando para ejecutar el servidor
# En desarrollo usaremos nodemon (npm run dev)
# En producción usaremos node (npm start)
CMD ["npm", "start"]
