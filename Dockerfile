# Stage 1: Build the Frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and lockfile
COPY package*.json ./

# Install all dependencies (including devDependencies for Vite build)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the Vite app (outputs to /app/dist)
RUN npm run build

# Stage 2: Production Server
FROM node:18-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy package.json and install ONLY production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built frontend from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the server source code
COPY src/server ./src/server

# Expose the application port
EXPOSE 5000

# Start the server
CMD ["node", "src/server/server.js"]
