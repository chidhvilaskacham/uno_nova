# Build Stage for Frontend
FROM node:18-alpine AS build-frontend
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client/ ./client/
RUN cd client && npm run build

# Production Stage
FROM node:18-alpine
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Copy server dependencies first for caching
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy server source
COPY server/ ./server/

# Copy built frontend from build stage
COPY --from=build-frontend /app/client/dist ./client/dist

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server/server.js"]
