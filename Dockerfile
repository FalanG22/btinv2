# 1. Usar una imagen oficial de Node.js como base.
# Se elige la versión 20-alpine por ser ligera y segura.
FROM node:20-alpine AS base

# 2. Establecer el directorio de trabajo dentro del contenedor.
WORKDIR /app

# 3. Copiar los archivos de definición de paquetes e instalarlos.
# Se copian por separado para aprovechar el caché de Docker.
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# 4. Copiar el resto del código de la aplicación.
COPY . .

# 5. Construir la aplicación para producción.
RUN npm run build

# 6. Exponer el puerto en el que se ejecutará la aplicación.
# El script "start" de Next.js se ejecuta en el puerto 3000 por defecto.
# (Nota: en docker-compose.yml mapearemos este puerto al que desees)
EXPOSE 3000

# 7. Definir el comando para iniciar la aplicación.
CMD ["npm", "start"]
