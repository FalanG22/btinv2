# 1. Base Image
FROM node:20-alpine AS base
WORKDIR /app

# 2. Builder Stage
FROM base AS builder
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 3. Production Stage
FROM base AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY schema.sql ./

# Set the port
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
