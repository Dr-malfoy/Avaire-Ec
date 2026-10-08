FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies needed for node-gyp / native modules if any
RUN apk add --no-cache libc6-compat python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server.js"]
