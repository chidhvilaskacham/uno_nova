import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

const EmoteDisplay = ({ playerId }) => {
    const { socket } = useSocket();
    const [currentEmote, setCurrentEmote] = useState(null);

    useEffect(() => {
        if (!socket) return;

        const handleEmote = (data) => {
            if (data.playerId === playerId) {
                // Generate a unique ID to trigger re-render for same emote
                setCurrentEmote({
                    emoji: data.emoteType,
                    id: Math.random()
                });

                // Clear after 2 seconds
                setTimeout(() => {
                    setCurrentEmote(null);
                }, 2000);
            }
        };

        socket.on('player_emote', handleEmote);
        return () => socket.off('player_emote', handleEmote);
    }, [socket, playerId]);

    return (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none z-40">
            <AnimatePresence mode="wait">
                {currentEmote && (
                    <motion.div
                        key={currentEmote.id}
                        initial={{ opacity: 0, y: 20, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1.2 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="text-4xl drop-shadow-xl"
                    >
                        {currentEmote.emoji}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmoteDisplay;
