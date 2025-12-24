# Multiplayer UNO Game

A real-time, web-based multiplayer UNO game built with React, Tailwind CSS, Node.js, and Socket.io.

## Features
- **Lobby System**: Create or join rooms with a unique 6-character code.
- **Real-time Gameplay**: Powered by Socket.io for instant turn updates and card actions.
- **Complete UNO Rules**: Includes Skip, Reverse, Draw 2, Wild, and Wild Draw 4 cards.
- **Responsive UI**: Beautifully designed with Tailwind CSS, glassmorphism, and smooth animations.
- **Fog of War**: Players can only see their own hands; opponents' cards are hidden.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Lucide icons.
- **Backend**: Node.js, Express, Socket.io.
- **Deployment**: Docker ready.

## Local Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd uno-game
```

### 2. Install dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Run the application
```bash
# Start backend (from /server)
npm start

# Start frontend (from /client)
npm run dev
```

## Deployment Instructions

### Render
1. Create a "Web Service" on Render.
2. Link your GitHub repository.
3. Select "Docker" as the Environment.
4. Render will automatically detect the `Dockerfile` and build/deploy your app.

### Vercel (Frontend Only)
1. Deploy the `client` directory to Vercel.
2. Update the `SocketContext.jsx` connection URL to point to your deployed backend.

### Railway
1. Create a new Project on Railway.
2. Deploy from GitHub repo.
3. Railway will automatically build the Docker image and deploy.

## Environment Variables
- `PORT`: The port the server runs on (default: 5000).
- `CLIENT_URL`: (Optional) For CORS configuration in production.
