# 1. Base Image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install dependencies for building and running
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Build the Next.js application for production
RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Install netcat for the wait script
RUN apt-get update && apt-get install -y netcat-openbsd

# Start the application
# This command will wait for the database to be available on port 3306 before starting the app.
CMD sh -c "while ! nc -z db 3306; do echo 'Waiting for DB...'; sleep 1; done; npm start"
