import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Users, Layout, Hash, AlertCircle, Activity, Copy, Check, Settings, Shield, Zap, Info, Database, Link as LinkIcon, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';

const Avatar = ({ index, ready }) => (
    <div className="relative group">
        <div className={`absolute -inset-2 rounded-full border-2 border-transparent transition-all duration-500 ${ready ? 'border-neon-green shadow-glow-green scale-110 opacity-100' : 'opacity-0'}`} />
        <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 glass-space relative z-10 transition-transform group-hover:scale-110 bg-black/40 flex items-center justify-center">
            <Users size={32} className={`transition-colors duration-300 ${ready ? 'text-neon-green' : 'text-zinc-700'}`} />
        </div>
        {ready && (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-neon-green text-black text-[8px] px-2 py-0.5 rounded-sm font-black uppercase tracking-tighter z-20 shadow-glow-green"
            >
                Linked
            </motion.div>
        )}
    </div>
);

const PrivacyToggle = ({ isPublic, onToggle }) => (
    <div className="flex items-center justify-between w-full bg-black/20 p-2 rounded-lg border border-white/5">
        <button
            onClick={() => onToggle(false)}
            className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-md transition-all relative overflow-hidden ${!isPublic ? 'text-neon-red' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
            <Shield size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10">Encrypted</span>
            {!isPublic && <motion.div layoutId="toggle" className="absolute inset-0 bg-neon-red/10 border border-neon-red/30 shadow-glow-red rounded-md" />}
        </button>
        <div className="w-px h-6 bg-white/10" />
        <button
            onClick={() => onToggle(true)}
            className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-md transition-all relative overflow-hidden ${isPublic ? 'text-neon-blue' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
            <Layout size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10">Public</span>
            {isPublic && <motion.div layoutId="toggle" className="absolute inset-0 bg-neon-blue/10 border border-neon-blue/30 shadow-glow-blue rounded-md" />}
        </button>
    </div>
);

const BioScanInput = ({ value, onChange, placeholder, maxLength }) => (
    <div className="relative group rounded-xl overflow-hidden">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-6 px-10 text-white font-mono-aaa text-3xl focus:border-neon-blue/50 focus:outline-none transition-all tracking-[0.3em] text-center placeholder:text-zinc-800 placeholder:opacity-50"
            maxLength={maxLength}
        />
        <div className="absolute inset-0 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-x-0 h-[2px] bg-neon-blue/50 shadow-[0_0_15px_rgba(0,242,255,0.8)] animate-scan" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon-blue" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neon-blue" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neon-blue" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neon-blue" />
        </div>
    </div>
);

const PowerUpButton = ({ onClick, disabled, label, className }) => {
    const [progress, setProgress] = useState(0);
    const [active, setActive] = useState(false);

    const handleClick = () => {
        if (active) return;
        setActive(true);
        let p = 0;
        const interval = setInterval(() => {
            p += 5;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                onClick();
                setTimeout(() => {
                    setActive(false);
                    setProgress(0);
                }, 500);
            }
        }, 20);
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || active}
            className={`relative overflow-hidden group ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-glow-blue'}`}
        >
            <span className="relative z-10 flex items-center justify-center gap-3">
                {active ? 'INITIALIZING...' : label}
                {active && <span className="font-mono-aaa">{progress}%</span>}
            </span>
            <div
                className="absolute inset-0 bg-white/10 transition-transform duration-100 ease-linear origin-left"
                style={{ transform: `scaleX(${progress / 100})` }}
            />
        </button>
    );
};

const DecipherQR = ({ value }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            {!visible && (
                <div className="absolute inset-0 grid grid-cols-4 gap-1 p-2">
                    {[...Array(16)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.05 }}
                            className="bg-neon-blue/20 rounded-sm"
                        />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-neon-blue animate-pulse tracking-widest">
                        DECIPHERING...
                    </div>
                </div>
            )}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
                className="bg-white p-3 rounded-xl shadow-glow-white"
            >
                <QRCode value={value} size={160} level="H" />
            </motion.div>
        </div>
    );
};

const Radar = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-full h-full border border-neon-blue/30 rounded-full animate-pulse-slow" />
        <div className="absolute w-[90%] h-[90%] border border-dashed border-neon-blue/20 rounded-full" />
        <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-neon-green to-transparent animate-spin opacity-50" />
        <div className="absolute w-4 h-4 bg-neon-red rounded-full blur-[2px] animate-radar" />
    </div>
);

const LobbyBrowser = ({ rooms, onJoin }) => (
    <div className="flex flex-col gap-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar relative">
        {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="w-24 h-24 relative">
                    <Radar />
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-600 animate-pulse">
                    Scanning Sector...<br />No Signals
                </span>
            </div>
        ) : (
            rooms.map((room, i) => (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={room.roomId}
                    className="p-4 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between group hover:border-neon-blue/50 hover:bg-neon-blue/5 transition-all"
                >
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                            {room.host}
                        </span>
                        <span className="text-[8px] font-mono-aaa text-zinc-500 uppercase">CMD: {room.roomId}</span>
                    </div>
                    <button
                        onClick={() => onJoin(room.roomId)}
                        className="px-3 py-1.5 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 rounded text-[9px] font-black uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all"
                    >
                        Link
                    </button>
                </motion.div>
            ))
        )}
    </div>
);

const Lobby = () => {
    const [name, setName] = useState('');
    const [roomInput, setRoomInput] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const { createRoom, joinRoom, roomId, players, startGame, error, playerName: socketPlayerName, isConnected, publicRooms, getPublicRooms } = useSocket();
    const [copied, setCopied] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Fetch public rooms on mount and when connected
    useEffect(() => {
        if (isConnected) {
            getPublicRooms();
        }
    }, [isConnected]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const room = params.get('room');
        if (room) {
            setRoomInput(room.toUpperCase());
        }
    }, []);

    // Reset connecting state if we get a room ID or error
    useEffect(() => {
        if (roomId || error) {
            setIsConnecting(false);
        }
    }, [roomId, error]);

    const handleCopy = () => {
        const joinUrl = `${window.location.origin}?room=${roomId}`;
        navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreate = () => {
        if (!isConnected || !name.trim()) return;
        setIsConnecting(true);
        // Small delay to show animation if server is too fast
        setTimeout(() => createRoom(name, isPublic), 1500);
    };

    const handleJoin = () => {
        if (!name.trim() || !roomInput.trim()) return;
        joinRoom(roomInput.toUpperCase(), name);
    };

    const handleJoinPublic = (id) => {
        if (!name.trim()) return;
        joinRoom(id, name);
    };

    const isRoomCodeValid = roomInput.length === 6 && /^[A-Z0-9]+$/.test(roomInput);

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 md:p-12 overflow-hidden bg-[#020204]">
            <div className="scan-grid" />

            {/* Tickers Removed */}

            <main className="w-full max-w-7xl relative z-10 space-y-8 pb-12">
                {/* Header Information HUD */}
                <div className="flex justify-between items-end px-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green pulse-status' : 'bg-neon-red'}`} />
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">UNO NOVA</h2>
                        </div>
                        <p className="text-[10px] font-mono-aaa text-neon-blue uppercase tracking-[0.6em] font-bold animate-pulse">Mission Control Interface</p>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left: Squad Cluster OR Lobby Browser */}
                    <motion.section
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-12 lg:col-span-3 glass-space p-8 flex flex-col gap-6"
                    >
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                                    {roomId ? 'Squadron' : 'Sector Scan'}
                                </h3>
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${roomId ? 'bg-neon-green animate-blink' : 'bg-neon-blue animate-pulse'}`} />
                                    {roomId ? 'Live Feed' : 'Searching...'}
                                </span>
                            </div>
                        </div>

                        {roomId ? (
                            <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px] custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {players.map((p, i) => (
                                        <motion.div
                                            key={p.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-4 group"
                                        >
                                            <Avatar index={i} ready={true} />
                                            <div className="flex flex-col min-w-0">
                                                <span className="truncate font-black text-xs tracking-widest text-white uppercase font-mono-aaa">{p.name}</span>
                                                <span className="text-[8px] text-neon-green font-black uppercase tracking-[0.2em]">Ready</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <LobbyBrowser rooms={publicRooms} onJoin={handleJoinPublic} />
                        )}

                        {roomId && (
                            <button
                                onClick={startGame}
                                className="mt-auto relative w-full group overflow-hidden bg-neon-green text-black font-black italic tracking-[0.2em] text-sm py-5 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_40px_rgba(57,255,20,0.6)] hover:scale-[1.02] transition-all duration-300 active:scale-95"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    INITIATE GRID
                                    <Zap size={16} className="fill-black" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                            </button>
                        )}
                    </motion.section>

                    {/* Center: Tactical Singularity */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="col-span-12 lg:col-span-6 flex flex-col gap-8"
                    >
                        <div className="glass-space flex-1 p-12 flex flex-col items-center justify-center text-center gap-12 relative overflow-hidden min-h-[500px]">
                            {/* Inner grid overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                            {isConnecting ? (
                                <div className="flex flex-col items-center justify-center gap-8 z-10">
                                    {/* Rotating Wireframe Spinner */}
                                    <div className="relative w-32 h-32">
                                        <div className="absolute inset-0 border-4 border-neon-blue/30 rounded-full animate-[spin_3s_linear_infinite]" />
                                        <div className="absolute inset-2 border-4 border-t-neon-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_1s_linear_infinite]" />
                                        <div className="absolute inset-8 border-2 border-dashed border-white/50 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.3em] text-neon-blue animate-pulse">
                                        Establishing Secure Link...
                                    </span>
                                </div>
                            ) : roomId ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="space-y-10 w-full relative z-10"
                                >
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.8em] text-neon-blue">Sector Authorized</label>
                                        <h1 className="text-8xl font-mono-aaa font-black tracking-widest text-white drop-shadow-lg">
                                            {roomId}
                                        </h1>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="mx-auto px-8 py-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center gap-4 group"
                                    >
                                        {copied ? <Check size={18} className="text-neon-green" /> : <LinkIcon size={18} className="text-neon-blue group-hover:text-white transition-colors" />}
                                        <span className="text-xs font-black uppercase tracking-[0.3em] text-white">
                                            {copied ? 'Coordinates Copied' : 'Copy Coordinates'}
                                        </span>
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="w-full max-w-md space-y-10 relative z-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-center gap-3 opacity-70">
                                            <Users size={16} className="text-neon-blue" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Pilot Identification</span>
                                        </div>
                                        <BioScanInput
                                            value={name}
                                            onChange={(e) => setName(e.target.value.toUpperCase())}
                                            placeholder="ENTER CALLSIGN"
                                            maxLength={12}
                                        />
                                    </div>

                                    <div className="space-y-6 pt-6 border-t border-white/5">
                                        <PrivacyToggle isPublic={isPublic} onToggle={setIsPublic} />
                                        <button
                                            onClick={handleCreate}
                                            disabled={!name.trim()}
                                            className={`group relative w-full overflow-hidden font-black italic tracking-[0.2em] text-lg py-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isPublic
                                                    ? 'bg-neon-blue text-black shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_40px_rgba(0,242,255,0.6)]'
                                                    : 'bg-neon-red text-white shadow-[0_0_20px_rgba(255,62,62,0.3)] hover:shadow-[0_0_40px_rgba(255,62,62,0.6)]'
                                                }`}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-4">
                                                {isPublic ? 'BROADCAST SIGNAL' : 'INITIALIZE GRID'}
                                                <Zap size={20} className={isPublic ? "fill-black" : "fill-white"} />
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                                        </button>
                                    </div>

                                    <div className="relative py-4 flex items-center justify-center">
                                        <div className="absolute inset-x-0 h-px bg-white/5" />
                                        <span className="relative bg-[#0a0a0f] px-4 text-[9px] font-black uppercase tracking-widest text-zinc-600">Or Join Existing Grid</span>
                                    </div>

                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="GRID KEY"
                                            value={roomInput}
                                            onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                                            className={`flex-1 bg-black/40 border ${roomInput && !isRoomCodeValid ? 'border-neon-red/50' : 'border-white/10'} rounded-xl text-center text-white font-mono-aaa tracking-[0.3em] uppercase focus:border-neon-blue/50 outline-none transition-colors max-w-[200px]`}
                                            maxLength={6}
                                        />
                                        <button
                                            onClick={handleJoin}
                                            disabled={!name.trim() || !isRoomCodeValid}
                                            className="flex-1 px-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 rounded-xl transition-all disabled:opacity-30 text-[10px]"
                                        >
                                            Link to Sector
                                        </button>
                                    </div>
                                    {roomInput && !isRoomCodeValid && (
                                        <span className="text-[8px] text-neon-red font-black uppercase tracking-widest animate-pulse block">
                                            Invalid Access Key
                                        </span>
                                    )}
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
                        transition={{ delay: 0.4 }}
                        className="col-span-12 lg:col-span-3 glass-space p-8 flex flex-col gap-6"
                    >
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Instant Relay</h3>
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Mobile Uplink</span>
                            </div>
                            <QrCode size={18} className="text-zinc-600" />
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center py-8">
                            {roomId ? (
                                <DecipherQR value={`${window.location.origin}?room=${roomId}`} />
                            ) : (
                                <div className="w-full flex flex-col items-center justify-center gap-4 py-8 border-2 border-dashed border-white/5 rounded-2xl bg-white/2">
                                    <QrCode size={32} className="text-zinc-700 opacity-50" />
                                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest text-center px-4">Generate Grid to<br />Reveal Matrix</span>
                                </div>
                            )}

                            <div className="space-y-3 w-full mt-8">
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                    <Zap size={14} className="text-neon-blue" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-white uppercase tracking-tighter">Fast Entry</span>
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Auto-Negotiation</span>
                                    </div>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                    <Shield size={14} className="text-neon-green" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-white uppercase tracking-tighter">Secure Link</span>
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">256-bit Encryption</span>
                                    </div>
                                </motion.div>
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
