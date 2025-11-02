# Auth-Service/Dockerfile
FROM node:18-bullseye

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4003

CMD ["npm", "start"]
