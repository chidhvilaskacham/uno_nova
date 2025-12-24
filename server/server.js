const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const GameLogic = require('./utils/GameLogic');
const path = require('path');

const app = express();
app.use(cors());

// Health check endpoint for efficiency monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', players: rooms.size });
});

// Serve static files from the React app
const staticPath = path.join(__dirname, '../client/dist');
app.use(express.static(staticPath));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'Total rooms:', rooms.size);

  socket.on('create_room', ({ playerName }) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.join(roomId);

    const game = new GameLogic();
    const player = {
      id: socket.id,
      name: playerName,
      hand: [],
    };

    rooms.set(roomId, {
      roomId,
      players: [player],
      game,
      status: 'waiting', // waiting, playing, ended
    });

    socket.emit('room_created', { roomId, players: [player] });
    console.log(`Room created: ${roomId} by ${playerName}`);
  });

  socket.on('join_room', ({ roomId, playerName }) => {
    const room = rooms.get(roomId);
    if (!room) {
      console.log(`Join failed: Room ${roomId} not found`);
      socket.emit('error', 'Room not found');
      return;
    }
    if (room.status !== 'waiting') {
      console.log(`Join failed: Room ${roomId} already playing`);
      socket.emit('error', 'Game already started');
      return;
    }
    if (room.players.length >= 4) {
      console.log(`Join failed: Room ${roomId} is full`);
      socket.emit('error', 'Room is full');
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      hand: [],
    };
    room.players.push(player);
    socket.join(roomId);

    io.to(roomId).emit('player_joined', { roomId, players: room.players });
    console.log(`${playerName} joined room: ${roomId}`);
  });

  socket.on('start_game', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Room not found. It may have been closed.');
      return;
    }

    // Solo Mode: Add a bot if only 1 player
    if (room.players.length === 1) {
      const bot = {
        id: 'bot_' + Math.random().toString(36).substring(2, 5),
        name: 'CPU (Bot)',
        hand: [],
        isBot: true
      };
      room.players.push(bot);
      console.log(`Solo Mode: Added bot to room ${roomId}`);
    }

    room.status = 'playing';
    room.game.initGame(room.players);

    // Send targeted updates to each player
    room.players.forEach(p => {
      if (!p.isBot) {
        io.to(p.id).emit('game_started', {
          gameState: room.game.getGameState(),
          players: room.players.map(p2 => ({
            id: p2.id,
            name: p2.name,
            cardCount: p2.hand.length,
            isBot: p2.isBot
          })),
          hand: p.hand
        });
      }
    });
  });

  socket.on('play_card', ({ roomId, cardIndex, color }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Game session lost. Please return to lobby.');
      return;
    }

    const result = room.game.playCard(socket.id, cardIndex, color);
    if (result.success) {
      room.players.forEach(p => {
        if (!p.isBot) {
          io.to(p.id).emit('game_update', {
            gameState: room.game.getGameState(),
            players: room.players.map(p2 => ({
              id: p2.id,
              name: p2.name,
              cardCount: p2.hand.length,
              isBot: p2.isBot
            })),
            hand: p.hand,
            lastAction: { type: 'play', player: socket.id, card: result.card }
          });
        }
      });

      if (result.winner) {
        io.to(roomId).emit('game_over', { winner: result.winner });
        room.status = 'ended';
      } else {
        triggerBotTurn(roomId);
      }
    } else {
      socket.emit('error', result.message);
    }
  });

  socket.on('draw_card', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Game session lost. Please return to lobby.');
      return;
    }

    const result = room.game.drawCard(socket.id);
    if (result.success) {
      room.players.forEach(p => {
        if (!p.isBot) {
          io.to(p.id).emit('game_update', {
            gameState: room.game.getGameState(),
            players: room.players.map(p2 => ({
              id: p2.id,
              name: p2.name,
              cardCount: p2.hand.length,
              isBot: p2.isBot
            })),
            hand: p.hand,
            lastAction: { type: 'draw', player: socket.id }
          });
        }
      });
      triggerBotTurn(roomId);
    } else {
      socket.emit('error', result.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Handle SPA routing - return all requests to React app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

const triggerBotTurn = (roomId) => {
  const room = rooms.get(roomId);
  if (!room || room.status !== 'playing') return;

  const currentPlayer = room.players[room.game.currentPlayerIndex];
  if (currentPlayer && currentPlayer.isBot) {
    setTimeout(() => {
      const botMove = room.game.getBotMove(currentPlayer.id);
      if (botMove.action === 'play') {
        const result = room.game.playCard(currentPlayer.id, botMove.cardIndex, botMove.color);

        room.players.forEach(p => {
          if (!p.isBot) {
            io.to(p.id).emit('game_update', {
              gameState: room.game.getGameState(),
              players: room.players.map(p2 => ({
                id: p2.id,
                name: p2.name,
                cardCount: p2.hand.length,
                isBot: p2.isBot
              })),
              hand: p.hand,
              lastAction: { type: 'play', player: currentPlayer.id, card: result.card }
            });
          }
        });

        if (result.winner) {
          io.to(roomId).emit('game_over', { winner: result.winner });
          room.status = 'ended';
        } else {
          triggerBotTurn(roomId);
        }
      } else {
        room.game.drawCard(currentPlayer.id);
        room.players.forEach(p => {
          if (!p.isBot) {
            io.to(p.id).emit('game_update', {
              gameState: room.game.getGameState(),
              players: room.players.map(p2 => ({
                id: p2.id,
                name: p2.name,
                cardCount: p2.hand.length,
                isBot: p2.isBot
              })),
              hand: p.hand,
              lastAction: { type: 'draw', player: currentPlayer.id }
            });
          }
        });
        triggerBotTurn(roomId);
      }
    }, 800); // Reduced from 1500ms for more efficient feel
  }
};

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
