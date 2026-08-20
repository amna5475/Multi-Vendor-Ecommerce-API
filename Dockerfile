FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy application source
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "./bin/www"]
