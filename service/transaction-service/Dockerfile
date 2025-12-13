# ============================
# Transaction Service - Production Dockerfile (JavaScript)
# ============================
FROM node:18-bullseye

WORKDIR /app

# Copy dependency files first (cache npm install)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client (required)
RUN npx prisma generate

# Expose service port
EXPOSE 4003

# On container start: run migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]