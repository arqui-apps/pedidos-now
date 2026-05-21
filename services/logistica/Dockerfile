# Dockerfile para Módulo de Logística
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3005

# Script de inicio que sincroniza DB si es necesario
CMD ["sh", "-c", "node syncDatabase.js && node server.js"]
