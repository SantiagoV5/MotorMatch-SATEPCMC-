# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile para Frontend (React + Vite) - Multi-stage build
# ─────────────────────────────────────────────────────────────────────────────

# STAGE 1: Build - Compilar la aplicación React
FROM node:20-alpine AS builder

WORKDIR /app/frontend

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala dependencias
RUN npm ci --legacy-peer-deps

# Copia el código fuente
COPY . .

# Compila la aplicación (genera la carpeta dist)
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 2: Production - Sirve la aplicación compilada
FROM nginx:alpine

# Copia la configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copia los archivos compilados desde el stage anterior
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]
