# Fase 1: Entorno de construcción (Builder)
# Usa la imagen oficial de Node.js v20 como base.
FROM node:20-alpine AS builder

# Establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copia los archivos de manifiesto del paquete (package.json y package-lock.json).
# Usar `COPY` selectivo aprovecha el caché de capas de Docker.
COPY package*.json ./

# Instala las dependencias del proyecto.
RUN npm install

# Copia el resto del código fuente de la aplicación.
COPY . .

# Construye la aplicación Next.js para producción.
# Esto genera una carpeta .next optimizada.
RUN npm run build

# Fase 2: Entorno de producción (Runner)
# Usa una imagen de Node.js más ligera para producción.
FROM node:20-alpine AS runner

# Establece el directorio de trabajo.
WORKDIR /app

# Copia las dependencias de producción desde la fase de construcción.
# Esto evita tener las dependencias de desarrollo en la imagen final.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copia la aplicación construida desde la fase de construcción.
# La carpeta .next/standalone contiene solo lo necesario para ejecutar la app.
COPY --from=builder /app/.next/standalone ./

# Copia la carpeta `public` y el archivo `db.json` (que será montado).
COPY --from=builder /app/public ./public
COPY --from=builder /app/db.json ./db.json


# Expone el puerto 3000, que es el puerto por defecto en el que Next.js se ejecuta.
EXPOSE 3000

# El comando para iniciar la aplicación.
# Ejecuta el servidor Node.js que Next.js proporciona para producción.
CMD ["node", "server.js"]
