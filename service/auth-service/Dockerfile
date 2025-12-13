# ============================
#   BASE IMAGE
# ============================
FROM node:18-bullseye

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose service port
EXPOSE 4001

# ============================
#   START COMMAND (IMPORTANT)
# ============================
# Run migrations, then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
