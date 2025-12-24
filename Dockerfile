# Use Node.js 18 image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package.json files first for better caching
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd server && npm install --production
RUN cd client && npm install

# Copy source code
COPY server/ ./server/
COPY client/ ./client/

# Build the frontend
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "server/server.js"]
