FROM node:18-alpine

WORKDIR /app

# Copy dependency files first (cache npm install)
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
