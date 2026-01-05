import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Send, Smile, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBox = () => {
    const { socket, roomId, playerName, players } = useSocket();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [recipientId, setRecipientId] = useState(null); // For whispers
    const [showMentions, setShowMentions] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!socket) return;

        socket.on('new_chat_message', (msg) => {
            setMessages(prev => [...prev.slice(-49), msg]);
            if (!isOpen) {
                // Future: show notification badge
            }
        });

        socket.on('chat_history', (history) => {
            setMessages(history);
        });

        // Fetch history on mount
        socket.emit('get_chat_history', { roomId });

        return () => {
            socket.off('new_chat_message');
            socket.off('chat_history');
        };
    }, [socket, roomId]);

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        socket.emit('send_chat_message', {
            roomId,
            message: input,
            isWhisper: !!recipientId,
            recipientId
        });

        setInput('');
        setRecipientId(null);
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInput(val);

        if (val.endsWith('@')) {
            setShowMentions(true);
        } else if (!val.includes('@')) {
            setShowMentions(false);
        }
    };

    const insertMention = (p) => {
        setInput(prev => prev.replace(/@$/, `@${p.name} `));
        setShowMentions(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-80 h-96 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <MessageCircle size={18} /> Game Chat
                            </h3>
                            {recipientId && (
                                <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full flex items-center gap-1">
                                    <User size={10} /> Whisper: {players.find(p => p.id === recipientId)?.name}
                                    <button onClick={() => setRecipientId(null)} className="ml-1 hover:text-white">×</button>
                                </span>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.sender.id === socket.id ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] text-white/40">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="text-xs font-medium text-white/60">{msg.sender.name}</span>
                                    </div>
                                    <div className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] break-words ${msg.isWhisper
                                            ? 'bg-purple-500/20 text-purple-100 border border-purple-500/30'
                                            : msg.sender.id === socket.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white/10 text-white border border-white/10'
                                        }`}>
                                        {msg.message}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Mentions Suggestion */}
                        {showMentions && (
                            <div className="absolute bottom-16 left-4 right-4 bg-gray-900 border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                {players.filter(p => p.id !== socket.id).map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => insertMention(p)}
                                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-black/20">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder={recipientId ? "Type a whisper..." : "Type a message... (@ for players)"}
                                    maxLength={1000}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 p-1"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition-all active:scale-95 group"
            >
                {isOpen ? <MessageCircle size={24} /> : (
                    <div className="relative">
                        <MessageCircle size={24} />
                        {/* Future: Pulse indicator for unread messages */}
                    </div>
                )}
            </button>
        </div>
    );
};

export default ChatBox;
