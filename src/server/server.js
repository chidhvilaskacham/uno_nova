import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import profanityCleaner from 'profanity-cleaner';
const { clean } = profanityCleaner;

import GameLogic from './utils/GameLogic.js';
import ChatMessage from './models/ChatMessage.js';
import EmoteAnalytics from './models/EmoteAnalytics.js';

// Construct __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Dotenv
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Routes
// Health check endpoint for efficiency monitoring

// Health check endpoint for efficiency monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', players: rooms.size });
});

// Serve static files from the React app
const staticPath = path.join(__dirname, '../../dist');
app.use(express.static(staticPath));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();
const turnTimers = new Map();

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uno_nova')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
  socket.emit('public_rooms_update', getPublicRooms()); // Send initial list to new user
  console.log('User connected:', socket.id, 'Total rooms:', rooms.size);

  socket.on('request_public_rooms', () => {
    socket.emit('public_rooms_update', getPublicRooms());
  });

  socket.on('create_room', ({ playerName, isPublic = false }) => {
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
      isPublic
    });

    socket.emit('room_created', { roomId, players: [player] });
    console.log(`Room created: ${roomId} by ${playerName} (Public: ${isPublic})`);

    if (isPublic) {
      broadcastPublicRooms();
    }
  });

  socket.on('join_room', ({ roomId, playerName }) => {
    const room = rooms.get(roomId);
    if (!room) {
      console.log(`Join failed: Room ${roomId} not found`);
      socket.emit('error', 'Room not found');
      return;
    }

    // Check for reconnection
    if (room.status === 'playing') {
      const existingPlayerIndex = room.players.findIndex(p => p.name === playerName && !p.isBot && !p.isReconnected);
      if (existingPlayerIndex !== -1) {
        console.log(`Player ${playerName} reconnecting to room ${roomId}`);
        const existingPlayer = room.players[existingPlayerIndex];

        // Clear reconnection timer
        if (room.reconnectionTimers && room.reconnectionTimers.has(existingPlayer.id)) {
          clearTimeout(room.reconnectionTimers.get(existingPlayer.id));
          room.reconnectionTimers.delete(existingPlayer.id);
        }

        // Update player ID and mark as reconnected
        existingPlayer.id = socket.id;
        existingPlayer.isReconnected = true;
        socket.join(roomId);

        socket.emit('game_started', {
          gameState: { ...room.game.getGameState(), turnStartTime: room.turnStartTime },
          players: room.players.map(p2 => ({
            id: p2.id,
            name: p2.name,
            cardCount: p2.hand.length,
            isBot: p2.isBot
          })),
          hand: existingPlayer.hand
        });
        return;
      }

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
    if (room.isPublic) broadcastPublicRooms();
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
    if (room.isPublic) broadcastPublicRooms(); // Remove from public list
    room.game.initGame(room.players);

    // Send targeted updates to each player
    room.players.forEach(p => {
      if (!p.isBot) {
        io.to(p.id).emit('game_started', {
          gameState: { ...room.game.getGameState(), turnStartTime: room.turnStartTime },
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

    startTurnTimer(roomId);
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
          let actionType = 'play';
          if (result.card.value === 'skip') actionType = 'skip';
          else if (result.card.value === 'reverse') actionType = 'reverse';
          else if (result.card.value === 'draw2') actionType = 'draw2';
          else if (result.card.value === 'draw4') actionType = 'draw4';

          io.to(p.id).emit('game_update', {
            gameState: { ...room.game.getGameState(), turnStartTime: room.turnStartTime },
            players: room.players.map(p2 => ({
              id: p2.id,
              name: p2.name,
              cardCount: p2.hand.length,
              isBot: p2.isBot
            })),
            hand: p.hand,
            lastAction: {
              type: actionType,
              player: socket.id,
              card: result.card,
              playerName: room.players.find(pl => pl.id === socket.id)?.name
            }
          });
        }
      });

      if (result.winner) {
        io.to(roomId).emit('game_over', { winner: result.winner });
        room.status = 'ended';
        stopTurnTimer(roomId);
      } else {
        startTurnTimer(roomId);
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
            gameState: { ...room.game.getGameState(), turnStartTime: room.turnStartTime },
            players: room.players.map(p2 => ({
              id: p2.id,
              name: p2.name,
              cardCount: p2.hand.length,
              isBot: p2.isBot
            })),
            hand: p.hand,
            lastAction: {
              type: 'draw',
              player: socket.id,
              playerName: room.players.find(pl => pl.id === socket.id)?.name
            }
          });
        }
      });
      startTurnTimer(roomId);
      triggerBotTurn(roomId);
    } else {
      socket.emit('error', result.message);
    }
  });

  // --- Chat & Emotes System ---

  socket.on('send_chat_message', async ({ roomId, message, isWhisper, recipientId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    // Filter profanity
    const cleanMessage = clean(message);

    const chatData = {
      sender: { id: socket.id, name: player.name },
      roomId,
      message: cleanMessage,
      isWhisper,
      recipientId,
      timestamp: new Date()
    };

    try {
      // Persist to DB
      const savedMessage = await ChatMessage.create(chatData);

      if (isWhisper && recipientId) {
        // Direct message
        io.to(recipientId).emit('new_chat_message', savedMessage);
        socket.emit('new_chat_message', savedMessage); // Echo to sender
      } else {
        // Public message
        io.to(roomId).emit('new_chat_message', savedMessage);
      }
    } catch (err) {
      console.error('Error saving chat message:', err);
      socket.emit('error', 'Failed to send message');
    }
  });

  socket.on('send_emote', async ({ roomId, emoteType }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    // Broadcast emote to all players in the room
    io.to(roomId).emit('player_emote', {
      playerId: socket.id,
      emoteType,
      playerName: player.name
    });

    // Update analytics (UPSERT)
    try {
      await EmoteAnalytics.findOneAndUpdate(
        { playerId: socket.id, emoteType },
        {
          $inc: { usageCount: 1 },
          $set: { playerName: player.name, lastUsed: new Date() }
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Error updating emote analytics:', err);
    }
  });

  socket.on('get_chat_history', async ({ roomId }) => {
    try {
      const history = await ChatMessage.find({
        roomId,
        isWhisper: false // Only return public history for the room
      }).sort({ timestamp: 1 }).limit(50);

      socket.emit('chat_history', history);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Find all rooms the player was in
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];

        if (room.status === 'playing') {
          console.log(`Player ${player.name} disconnected from active room ${roomId}. Starting 30s grace period.`);

          // Set a timeout to replace the player with a bot if they don't reconnect
          if (!room.reconnectionTimers) room.reconnectionTimers = new Map();

          const timer = setTimeout(() => {
            const currentRoom = rooms.get(roomId);
            if (currentRoom && currentRoom.status === 'playing') {
              const stillMissing = currentRoom.players.find(p => p.id === socket.id && !p.isReconnected);
              if (stillMissing) {
                console.log(`Grace period expired for ${player.name} in ${roomId}. Replacing with bot.`);

                // Replace player with a bot
                const bot = {
                  id: 'bot_' + Math.random().toString(36).substring(2, 5),
                  name: `${player.name} (Bot)`,
                  hand: player.hand,
                  isBot: true
                };

                currentRoom.players[playerIndex] = bot;

                // Notify remaining players
                io.to(roomId).emit('game_update', {
                  gameState: currentRoom.game.getGameState(),
                  players: currentRoom.players.map(p2 => ({
                    id: p2.id,
                    name: p2.name,
                    cardCount: p2.hand.length,
                    isBot: p2.isBot
                  })),
                  lastAction: { type: 'system', message: `${player.name} replaced by CPU` }
                });

                // If it was the disconnected player's turn, trigger bot turn
                if (currentRoom.game.currentPlayerIndex === playerIndex) {
                  triggerBotTurn(roomId);
                }
              }
            }
          }, 30000); // 30 seconds

          room.reconnectionTimers.set(socket.id, timer);
        } else if (room.status === 'waiting') {
          // In waiting status, just remove the player
          room.players.splice(playerIndex, 1);
          if (room.players.length === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted (all players left)`);
          } else {
            io.to(roomId).emit('player_joined', { roomId, players: room.players });
          }
          if (room.isPublic) broadcastPublicRooms();
        }
      }
    });
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
            let actionType = 'play';
            if (result.card.value === 'skip') actionType = 'skip';
            else if (result.card.value === 'reverse') actionType = 'reverse';
            else if (result.card.value === 'draw2') actionType = 'draw2';
            else if (result.card.value === 'draw4') actionType = 'draw4';

            io.to(p.id).emit('game_update', {
              gameState: { ...room.game.getGameState(), turnStartTime: room.turnStartTime },
              players: room.players.map(p2 => ({
                id: p2.id,
                name: p2.name,
                cardCount: p2.hand.length,
                isBot: p2.isBot
              })),
              hand: p.hand,
              lastAction: {
                type: actionType,
                player: currentPlayer.id,
                card: result.card,
                playerName: currentPlayer.name
              }
            });
          }
        });

        if (result.winner) {
          io.to(roomId).emit('game_over', { winner: result.winner });
          room.status = 'ended';
          stopTurnTimer(roomId);
          if (room.isPublic) broadcastPublicRooms();
        } else {
          startTurnTimer(roomId);
          triggerBotTurn(roomId);
        }
      } else {
        room.game.drawCard(currentPlayer.id);
        room.players.forEach(p => {
          if (!p.isBot) {
            io.to(p.id).emit('game_update', {
              gameState: { ...room.game.getGameState(), turnStartTime: room.turnStartTime },
              players: room.players.map(p2 => ({
                id: p2.id,
                name: p2.name,
                cardCount: p2.hand.length,
                isBot: p2.isBot
              })),
              hand: p.hand,
              lastAction: {
                type: 'draw',
                player: currentPlayer.id,
                playerName: currentPlayer.name
              }
            });
          }
        });
        startTurnTimer(roomId);
        triggerBotTurn(roomId);
      }
    }, 800); // Reduced from 1500ms for more efficient feel
  }
};

// --- Public Room Broadcasting ---

const getPublicRooms = () => {
  const publicRooms = [];
  rooms.forEach((room, id) => {
    if (room.isPublic && room.status === 'waiting' && room.players.length < 4) {
      publicRooms.push({
        roomId: id,
        host: room.players[0].name,
        playerCount: room.players.length,
        maxPlayers: 4
      });
    }
  });
  return publicRooms;
};

const broadcastPublicRooms = () => {
  const roomList = getPublicRooms();
  io.emit('public_rooms_update', roomList);
};

const startTurnTimer = (roomId) => {
  stopTurnTimer(roomId);

  const room = rooms.get(roomId);
  if (!room || room.status !== 'playing') return;

  room.turnStartTime = Date.now();
  const TURN_DURATION = 15000; // 15 seconds

  const timer = setTimeout(() => {
    const currentRoom = rooms.get(roomId);
    if (!currentRoom || currentRoom.status !== 'playing') return;

    const currentPlayer = currentRoom.players[currentRoom.game.currentPlayerIndex];
    if (!currentPlayer) return;

    console.log(`Time expired for ${currentPlayer.name} in room ${roomId}. Forcing draw.`);

    // Force draw
    const result = currentRoom.game.drawCard(currentPlayer.id);
    if (result.success) {
      currentRoom.players.forEach(p => {
        if (!p.isBot) {
          io.to(p.id).emit('game_update', {
            gameState: { ...currentRoom.game.getGameState(), turnStartTime: currentRoom.turnStartTime },
            players: currentRoom.players.map(p2 => ({
              id: p2.id,
              name: p2.name,
              cardCount: p2.hand.length,
              isBot: p2.isBot
            })),
            hand: p.hand,
            lastAction: {
              type: 'system',
              message: 'TIME EXPIRED',
              playerName: currentPlayer.name
            }
          });
        }
      });
      startTurnTimer(roomId);
      triggerBotTurn(roomId);
    }
  }, TURN_DURATION);

  turnTimers.set(roomId, timer);
};

const stopTurnTimer = (roomId) => {
  if (turnTimers.has(roomId)) {
    clearTimeout(turnTimers.get(roomId));
    turnTimers.delete(roomId);
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
