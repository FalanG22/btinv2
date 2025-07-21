# 1. Base Image
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for 'better-sqlite3' and other native modules if needed
RUN apk add --no-cache libc6-compat

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 4. Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built app from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Install netcat for the wait script
RUN apk add --no-cache netcat-openbsd

# Copy and prepare the wait script
COPY wait-for-it.sh .
RUN chmod +x ./wait-for-it.sh

# Expose the port the app runs on
EXPOSE 3000

# The new command waits for the DB then starts the app
CMD ["./wait-for-it.sh", "db:3306", "--", "node", "server.js"]
