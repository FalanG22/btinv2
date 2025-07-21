# ---- Base Stage ----
# Utiliza una imagen oficial de Node.js 20 como base.
# 'alpine' es una versión ligera, ideal para producción.
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
# Copia los archivos de manifiesto del paquete y el lockfile.
FROM base AS deps
COPY package.json package-lock.json ./
# Instala solo las dependencias de producción para mantener la imagen ligera.
RUN npm install --omit=dev

# ---- Build Stage ----
# Construye la aplicación Next.js.
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ejecuta el script de construcción de Next.js.
RUN npm run build

# ---- Runner Stage ----
# La imagen final que se ejecutará.
FROM base AS runner
WORKDIR /app

# Copia los archivos de construcción y las dependencias de producción.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expone el puerto 3000 (el puerto por defecto en el que se ejecuta Next.js).
EXPOSE 3000

# El comando para iniciar la aplicación.
# 'node server.js' es el comando recomendado para ejecutar una app Next.js standalone.
CMD ["node", "server.js"]
