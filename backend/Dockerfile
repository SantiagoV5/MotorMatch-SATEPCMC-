FROM node:20-slim

RUN apt-get update && apt-get install -y openssl wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY package*.json ./
RUN npm install

COPY . .

# Genera el cliente Prisma usando credenciales placeholder (se sobreescriben en runtime)
RUN DATABASE_URL="postgresql://user:pass@localhost:5432/motormatch" \
    DIRECT_URL="postgresql://user:pass@localhost:5432/motormatch" \
    npx prisma generate

EXPOSE 3000

# Healthcheck que usa wget (ya instalado arriba) — necesario para Render
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# ─────────────────────────────────────────────────────────────────────────────
# CMD: usa npm start (node src/server.js) en lugar de npm run dev (nodemon).
#
# • LOCAL: docker-compose.yml sobreescribe este CMD con `command: npm run dev`,
#   así que el hot-reload sigue funcionando exactamente igual que antes.
#
# • RENDER: no hay sobreescritura, así que se ejecuta npm start → node puro,
#   sin nodemon, que es lo correcto para producción.
# ─────────────────────────────────────────────────────────────────────────────
CMD ["npm", "start"]
