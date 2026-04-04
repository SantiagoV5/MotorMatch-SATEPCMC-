
FROM node:20-alpine

WORKDIR /app/frontend

# Copia package.json
COPY package*.json ./

# Copia el código
RUN npm install
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]