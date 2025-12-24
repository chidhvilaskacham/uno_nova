import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [players, setPlayers] = useState([]);
    const [hand, setHand] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState(null);
    const [winner, setWinner] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        console.log("Socket: Initializing connection...");
        // Connect to current host in production, localhost in development
        const socketUrl = import.meta.env.PROD ? window.location.origin : 'http://localhost:5000';
        const newSocket = io(socketUrl);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log("Socket: Connected with ID:", newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log("Socket: Disconnected");
            setIsConnected(false);
        });

        newSocket.on('room_created', ({ roomId, players }) => {
            console.log("Socket: Room created", roomId, players);
            setRoomId(roomId);
            setPlayers(players);
        });

        newSocket.on('player_joined', ({ roomId, players }) => {
            console.log("Socket: Player joined", players);
            setRoomId(roomId);
            setPlayers(players);
        });

        newSocket.on('game_started', ({ gameState, players, hand }) => {
            console.log("Socket: Game started", gameState);
            setGameState(gameState);
            setPlayers(players);
            if (hand) setHand(hand);
        });

        newSocket.on('game_update', ({ gameState, players, hand }) => {
            console.log("Socket: Game update", hand);
            setGameState(gameState);
            setPlayers(players);
            if (hand) setHand(hand);
        });

        newSocket.on('game_over', ({ winner }) => {
            console.log("Socket: Game over. Winner:", winner);
            setWinner(winner);
        });

        newSocket.on('error', (msg) => {
            console.error("Socket: Error", msg);
            setError(msg);
            setTimeout(() => setError(null), 3000);
        });

        return () => newSocket.close();
    }, []);

    const createRoom = (name) => {
        setPlayerName(name);
        socket.emit('create_room', { playerName: name });
    };

    const joinRoom = (id, name) => {
        if (!socket) return;
        setPlayerName(name);
        socket.emit('join_room', { roomId: id, playerName: name });
    };

    const startGame = () => {
        socket.emit('start_game', { roomId });
    };

    const playCard = (cardIndex, color) => {
        socket.emit('play_card', { roomId, cardIndex, color });
    };

    const drawCard = () => {
        socket.emit('draw_card', { roomId });
    };

    const value = {
        socket,
        gameState,
        players,
        hand,
        roomId,
        playerName,
        error,
        winner,
        isConnected,
        createRoom,
        joinRoom,
        startGame,
        playCard,
        drawCard
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
