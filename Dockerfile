# Stage 1: Build Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Backend & Runtime
FROM node:20-alpine
WORKDIR /app
# Install some basic tools that the assistant might use or help install
RUN apk add --no-cache sudo bash curl git docker

COPY server/package*.json ./server/
RUN cd server && npm install --only=production

COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./client/dist

EXPOSE 3001
ENV NODE_ENV=production

CMD ["node", "server/index.js"]
