import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { motion } from 'framer-motion';

const emojis = ['😄', '😁', '🎉', '😤', '😭', '🔥', '💯', '👏'];

const EmoteMenu = () => {
    const { socket, roomId } = useSocket();

    const sendEmote = (emote) => {
        socket.emit('send_emote', { roomId, emoteType: emote });
    };

    return (
        <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
            {emojis.map((emoji) => (
                <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => sendEmote(emoji)}
                    className="text-2xl p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                    {emoji}
                </motion.button>
            ))}
        </div>
    );
};

export default EmoteMenu;
