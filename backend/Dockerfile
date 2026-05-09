FROM node:20-slim

RUN apt-get update && apt-get install -y openssl wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY package*.json ./
RUN npm install

COPY . .

# Usa el Prisma instalado localmente por npm install (versión 5.x del package.json)
# en lugar de "npx prisma generate", que descargaría la versión más reciente
# de npm (Prisma 7), incompatible con este proyecto.
# prisma generate solo lee el schema y genera el cliente — no necesita conectarse
# a la base de datos real, por eso no hacen falta DATABASE_URL ni DIRECT_URL aquí.
RUN node_modules/.bin/prisma generate

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Ejecuta node directamente en lugar de "npm start" para evitar el hook prestart,
# que intenta cargar ../.env con dotenv — ese archivo no existe en el contenedor
# de Render. Las variables de entorno las inyecta Render directamente.
CMD ["node", "src/server.js"]
