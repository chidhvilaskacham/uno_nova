# Multi-stage Dockerfile for UNO Game

# Stage 1: Build Frontend
FROM node:18-slim AS build-frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:18-slim
WORKDIR /app

# Copy server dependencies first
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy server source code
COPY server/ ./server/

# Copy built frontend from Stage 1
COPY --from=build-frontend /app/client/dist ./client/dist

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "server/server.js"]
