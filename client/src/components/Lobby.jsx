import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Users, Layout, Hash, AlertCircle, Activity, Copy, Check, Settings, Shield, Zap, Info, Database, Link as LinkIcon, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';

const Avatar = ({ index, ready }) => {
    return (
        <div className="relative group">
            <div className={`absolute -inset-2 rounded-full border-2 border-transparent transition-all duration-500 ${ready ? 'border-neon-green shadow-glow-green scale-110' : ''}`} />
            <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 glass-space relative z-10 transition-transform group-hover:scale-110 bg-black/40 flex items-center justify-center">
                <Users size={32} className={ready ? 'text-neon-green' : 'text-zinc-700'} />
            </div>
            {ready && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-neon-green text-black text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter z-20 shadow-glow-green"
                >
                    Linked
                </motion.div>
            )}
        </div>
    );
};

const Lobby = () => {
    const [name, setName] = useState('');
    const [roomInput, setRoomInput] = useState('');
    const { createRoom, joinRoom, roomId, players, startGame, error, playerName, isConnected } = useSocket();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const room = params.get('room');
        if (room) {
            setRoomInput(room.toUpperCase());
        }
    }, []);

    const handleCopy = () => {
        const joinUrl = `${window.location.origin}?room=${roomId}`;
        navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAction = (type) => {
        if (!name.trim()) return;
        if (type === 'create') {
            createRoom(name);
        } else if (type === 'join' && roomInput.trim()) {
            joinRoom(roomInput.toUpperCase(), name);
        }
    };

    const isRoomCodeValid = roomInput.length === 6 && /^[A-Z0-9]+$/.test(roomInput);

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 md:p-12 overflow-hidden">
            <div className="stars-container" />

            <main className="w-full max-w-7xl relative z-10 space-y-8">
                {/* Header Information HUD */}
                <div className="flex justify-between items-end px-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green pulse-status' : 'bg-neon-red'}`} />
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">UNO</h2>
                        </div>
                        <p className="text-[10px] font-mono-aaa text-zinc-600 uppercase tracking-[0.6em] font-bold">Deep Space Synchronization Grid</p>
                    </div>
                    <div className="hidden md:flex gap-6 items-center">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Master Clock</span>
                            <span className="text-xs font-black font-mono-aaa text-neon-blue">COORD-ALPHA-9</span>
                        </div>
                        <Shield size={20} className="text-neon-blue opacity-30" />
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left: Squad Cluster */}
                    <motion.section
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-12 lg:col-span-3 glass-space p-8 flex flex-col gap-10 border-neon-blue/20"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Squad Cluster</h3>
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{players.length}/10 Pilots Linked</span>
                            </div>
                            <Activity size={18} className="text-neon-blue opacity-40" />
                        </div>

                        <div className="flex flex-col gap-8 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {players.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="py-16 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2.5rem] bg-white/2"
                                    >
                                        <Users size={32} className="text-zinc-800 animate-pulse" />
                                        <span className="text-[9px] uppercase font-black tracking-[0.3em] mt-3 text-zinc-700">Awaiting Signal</span>
                                    </motion.div>
                                ) : (
                                    players.map((p, i) => (
                                        <motion.div
                                            key={p.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-6 group"
                                        >
                                            <Avatar index={i} ready={true} />
                                            <div className="flex flex-col min-w-0">
                                                <span className="truncate font-black text-xs tracking-widest text-white uppercase font-mono-aaa">{p.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em]">Pilot Status: Active</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {roomId && (
                            <button
                                onClick={startGame}
                                className="w-full py-5 bg-neon-green text-black font-black italic rounded-2xl tracking-[0.2em] text-sm hover:scale-105 transition-all shadow-glow-green uppercase mt-auto"
                            >
                                Initiate Grid
                            </button>
                        )}
                    </motion.section>

                    {/* Center: Tactical Singularity */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-12 lg:col-span-6 flex flex-col gap-8"
                    >
                        <div className="glass-space flex-1 p-12 flex flex-col items-center justify-center text-center gap-12 relative overflow-hidden min-h-[500px]">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/2 to-transparent pointer-events-none" />

                            {roomId ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="space-y-10 w-full"
                                >
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.8em] text-neon-blue">Bridge Access Terminal</label>
                                        <h1 className="text-7xl font-mono-aaa font-black tracking-[0.2em] text-white underline decoration-neon-blue/30 underline-offset-[12px]">
                                            {roomId}
                                        </h1>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="mx-auto glass-space px-12 py-5 flex items-center gap-4 border-white/10 hover:bg-white/5 group transition-all"
                                    >
                                        {copied ? <Check size={18} className="text-neon-green" /> : <LinkIcon size={18} className="text-neon-blue" />}
                                        <span className="text-xs font-black uppercase tracking-[0.3em] text-white">
                                            {copied ? 'Link Copied' : 'Copy Instant Link'}
                                        </span>
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="w-full space-y-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <Database size={14} className="text-neon-blue opacity-50" />
                                            <label className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500">Pilot Authorization Required</label>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="CALLSIGN"
                                            value={name}
                                            onChange={(e) => setName(e.target.value.toUpperCase())}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 px-10 text-white font-mono-aaa text-3xl focus:border-neon-blue/40 focus:outline-none transition-all tracking-[0.4em] text-center"
                                            maxLength={10}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-5">
                                        <button
                                            onClick={() => handleAction('create')}
                                            disabled={!name.trim()}
                                            className="w-full py-6 bg-neon-red text-white font-black italic rounded-2xl tracking-[0.3em] text-lg hover:bg-red-600 transition-all shadow-glow-red disabled:opacity-20 uppercase"
                                        >
                                            Generate Grid
                                        </button>

                                        <div className="flex items-center gap-6 px-8 py-2">
                                            <div className="flex-1 h-px bg-white/10" />
                                            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest font-mono-aaa">Secure Bridge Request</span>
                                            <div className="flex-1 h-px bg-white/10" />
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <div className="flex gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="ACCESS KEY"
                                                    value={roomInput}
                                                    onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                                                    className={`flex-1 bg-black/40 border ${roomInput && !isRoomCodeValid ? 'border-neon-red/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white font-mono-aaa text-xl focus:border-neon-green/40 focus:outline-none transition-all tracking-[.6em] text-center`}
                                                    maxLength={6}
                                                />
                                                <button
                                                    onClick={() => handleAction('join')}
                                                    disabled={!name.trim() || !isRoomCodeValid}
                                                    className="px-10 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 rounded-2xl transition-all disabled:opacity-10"
                                                >
                                                    Relink
                                                </button>
                                            </div>
                                            {roomInput && !isRoomCodeValid && (
                                                <span className="text-[8px] text-neon-red font-black uppercase tracking-widest animate-pulse">
                                                    Invalid Access Key: Requires 6 Alphanumeric Characters
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="glass-space nebula-red !rounded-2xl p-5 flex items-center gap-5"
                                >
                                    <AlertCircle size={20} className="text-neon-red" />
                                    <span className="text-[10px] font-black text-neon-red uppercase tracking-widest leading-relaxed">Matrix Error: {error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.section>

                    {/* Right: Instant Link QR */}
                    <motion.section
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-12 lg:col-span-3 glass-space p-8 flex flex-col gap-10"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Instant Link</h3>
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Mobile Synchronization</span>
                            </div>
                            <QrCode size={18} className="text-zinc-600" />
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center gap-8">
                            {roomId ? (
                                <div className="p-4 bg-white rounded-3xl shadow-glow-white border border-white/20">
                                    <QRCode
                                        value={`${window.location.origin}?room=${roomId}`}
                                        size={180}
                                        level="H"
                                    />
                                </div>
                            ) : (
                                <div className="w-full aspect-square border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 bg-white/2">
                                    <QrCode size={40} className="text-zinc-800" />
                                    <span className="text-[8px] uppercase font-black tracking-[0.3em] text-zinc-700 text-center px-6 leading-relaxed">
                                        Generate Grid to Reveal Access Matrix
                                    </span>
                                </div>
                            )}

                            <div className="space-y-4 w-full">
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <Zap size={14} className="text-neon-blue" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-white uppercase tracking-tighter">Fast Entry</span>
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Scan for Immediate Relay</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <Shield size={14} className="text-neon-green" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-white uppercase tracking-tighter">Secure Link</span>
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">End-to-End Grid Connection</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-white/5 space-y-4 opacity-30">
                            <div className="flex items-center gap-4">
                                <Shield size={14} className="text-neon-blue" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] font-mono-aaa">Encrypted Bridge: G-144</span>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </main>
        </div>
    );
};

export default Lobby;
