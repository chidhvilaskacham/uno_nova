import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Users, Shield, Zap, Check, Link as LinkIcon, QrCode, Globe, Cpu, Activity, Radio, Command } from 'lucide-react';
import QRCode from 'react-qr-code';

// 3D Holographic Sphere Component
const HoloSphere = () => (
    <div className="absolute inset-0 flex items-center justify-center opacity-60 pointer-events-none holo-sphere-container overflow-hidden">
        <div className="w-40 h-40 holo-sphere relative">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="holo-ring absolute inset-0 border-electric-cyan"
                    style={{
                        transform: `rotateX(${i * 45}deg) rotateY(${i * 45}deg)`,
                        animation: `rotate-sphere ${15 + i * 5}s linear infinite reverse`
                    }}
                />
            ))}
            <div className="absolute inset-8 rounded-full bg-electric-cyan/5 blur-md animate-pulse" />
        </div>
    </div>
);

const Avatar = ({ index, ready }) => (
    <div
        style={{ transitionDelay: `${index * 100}ms` }}
        className={`relative group transition-all duration-500 transform ${ready ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
    >
        <div className={`absolute -inset-1 rounded-full bg-gradient-to-r from-electric-cyan to-neon-violet opacity-0 transition-opacity duration-500 blur-sm ${ready ? 'opacity-70' : ''}`} />
        <div className="w-16 h-16 rounded-full glass-ethereal flex items-center justify-center relative z-10 border border-white/10 group-hover:border-electric-cyan/50 transition-colors">
            <Users size={24} className={`transition-all duration-300 ${ready ? 'text-electric-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'text-slate-400'}`} />
        </div>
        {ready && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <div className="bg-electric-cyan text-black text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(0,240,255,0.5)]">
                    Link
                </div>
            </div>
        )}
    </div>
);

const GlassInput = ({ value, onChange, placeholder, maxLength, type = "text", className = "" }) => (
    <div className="relative group">
        <input
            type={type}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            placeholder={placeholder}
            className={`w-full bg-transparent border-b border-white/10 py-3 text-center font-light-geo text-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-electric-cyan transition-all duration-500 ${className}`}
            spellCheck="false"
        />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-electric-cyan transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-700 ease-out origin-center shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
    </div>
);

const PrivacyTab = ({ isPublic, onToggle }) => (
    <div className="flex bg-white/5 rounded-full p-1 relative">
        <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-full shadow-inner transition-all duration-300 ease-out ${isPublic ? 'left-[50%]' : 'left-1'}`}
        />
        <button
            onClick={() => onToggle(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors relative z-10 ${!isPublic ? 'text-electric-cyan' : 'text-slate-500'}`}
        >
            <Shield size={12} /> Encrypted
        </button>
        <button
            onClick={() => onToggle(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors relative z-10 ${isPublic ? 'text-electric-cyan' : 'text-slate-500'}`}
        >
            <Globe size={12} /> Public
        </button>
    </div>
);

const Lobby = () => {
    const [name, setName] = useState('');
    const [roomInput, setRoomInput] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const { createRoom, joinRoom, roomId, players, startGame, error, isConnected, publicRooms, getPublicRooms } = useSocket();
    const [copied, setCopied] = useState(false);

    // Initial fetch
    useEffect(() => {
        if (isConnected) getPublicRooms();
    }, [isConnected]);

    // Parse URL room param
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const room = params.get('room');
        if (room) setRoomInput(room.toUpperCase());
    }, []);

    const handleCopy = () => {
        const joinUrl = `${window.location.origin}?room=${roomId}`;
        navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[#020408]">
            {/* Backgrounds */}
            <div className="nebula-bg" />
            <div className="absolute inset-0 stars" />

            {/* Main Container */}
            <main className="w-full max-w-7xl h-full max-h-[90vh] grid grid-cols-12 gap-6 p-6 relative z-10">

                {/* Header */}
                <header className="col-span-12 flex justify-between items-center h-16 glass-ethereal rounded-2xl px-8 mx-2 mt-2">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-electric-cyan shadow-[0_0_10px_rgba(0,240,255,0.8)] animate-pulse" />
                        <h1 className="text-2xl font-light-geo tracking-[0.2em] uppercase text-white">
                            UNO <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric-cyan to-neon-violet">NOVA</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-light-geo tracking-widest text-slate-400">
                        <Activity size={12} className="text-electric-cyan" />
                        SYSTEM_READY
                    </div>
                </header>

                {/* Left: Sector & Squad */}
                <section className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                    <div className="glass-ethereal rounded-3xl flex-1 p-6 flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-cyan/50 to-transparent opacity-50" />

                        <div className="flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
                            <Command size={14} className="text-electric-cyan" />
                            {roomId ? 'Squadron' : 'Sector Scan'}
                        </div>

                        {/* Holo Display Area */}
                        <div className="flex-1 relative flex flex-col items-center justify-center min-h-[200px]">
                            {roomId ? (
                                <div className="w-full space-y-3 relative z-10">
                                    <div className="space-y-3">
                                        {players.map((p, i) => (
                                            <div
                                                key={p.id}
                                                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-cyan/20 to-neon-violet/20 flex items-center justify-center text-electric-cyan">
                                                    <Users size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold tracking-widest text-white">{p.name}</span>
                                                    <span className="text-[10px] text-electric-cyan/80">CONNECTED</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <HoloSphere />
                                    <div className="absolute bottom-0 w-full text-center space-y-2">
                                        <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Active Signals</div>
                                        <div className="h-[150px] overflow-y-auto custom-scrollbar space-y-2">
                                            {publicRooms.length > 0 ? (
                                                publicRooms.map(room => (
                                                    <button
                                                        key={room.roomId}
                                                        onClick={() => { const name = prompt("CALLSIGN?"); if (name) joinRoom(room.roomId, name.toUpperCase()) }}
                                                        className="w-full p-2 text-xs text-left bg-white/5 hover:bg-electric-cyan/10 border border-white/5 hover:border-electric-cyan/30 rounded-lg transition-all flex justify-between group/room"
                                                    >
                                                        <span className="text-slate-300 group-hover/room:text-white">{room.host}</span>
                                                        <span className="text-slate-500 font-mono">{room.roomId}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="text-[10px] text-slate-600 italic mt-8">Scanning deep space...</div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {roomId && (
                        <button
                            onClick={startGame}
                            className="glass-ethereal p-6 rounded-3xl btn-liquid group flex items-center justify-center gap-3 text-white font-bold tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-95 transition-transform"
                        >
                            <Zap size={18} className="text-electric-cyan group-hover:text-white transition-colors" />
                            ENGAGE_HYPERDRIVE
                        </button>
                    )}
                </section>

                {/* Center: Main Pilot Interface */}
                <section className="col-span-12 lg:col-span-6 flex flex-col">
                    <div className="glass-ethereal rounded-[2rem] flex-1 p-8 lg:p-12 flex flex-col items-center justify-center relative overflow-visible">
                        {/* Glow Behind */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-electric-cyan/5 blur-[100px] -z-10 rounded-full pointer-events-none" />

                        {roomId ? (
                            <div className="text-center space-y-8 w-full max-w-md relative z-10">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-[0.4em] text-electric-cyan mb-4">Coordinates Locked</div>
                                    <h2 className="text-8xl font-light-geo text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] tracking-tighter">
                                        {roomId}
                                    </h2>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="px-8 py-3 rounded-full border border-white/10 hover:border-electric-cyan/50 hover:bg-electric-cyan/10 transition-all flex items-center gap-3 mx-auto text-xs tracking-[0.2em] text-slate-300 hover:text-white group"
                                >
                                    {copied ? <Check size={14} className="text-electric-cyan" /> : <LinkIcon size={14} />}
                                    {copied ? 'COPIED' : 'SHARE_VECTOR'}
                                </button>
                            </div>
                        ) : (
                            <div className="w-full max-w-sm space-y-12 relative z-10">

                                <div className="space-y-6">
                                    <h3 className="text-center text-xs font-bold uppercase tracking-[0.4em] text-slate-500">Pilot Authorization</h3>
                                    <GlassInput
                                        value={name}
                                        onChange={(e) => setName(e.target.value.toUpperCase())}
                                        placeholder="ENTER CALLSIGN"
                                        maxLength={10}
                                        className="text-3xl"
                                    />
                                </div>

                                <div className="space-y-6">
                                    <PrivacyTab isPublic={isPublic} onToggle={setIsPublic} />

                                    <button
                                        onClick={() => name.trim() && createRoom(name, isPublic)}
                                        disabled={!name.trim()}
                                        className="w-full py-5 rounded-2xl btn-liquid font-bold tracking-[0.2em] text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:shadow-[0_0_50px_rgba(181,23,158,0.3)] transition-shadow"
                                    >
                                        INITIALIZE SEQUENCE
                                    </button>
                                </div>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-1 border-t border-white/10"></div>
                                    <span className="shrink-0 px-4 text-[10px] uppercase tracking-widest text-slate-600">Or Intercept</span>
                                    <div className="flex-1 border-t border-white/10"></div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <GlassInput
                                            value={roomInput}
                                            onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                                            placeholder="VECTOR KEY"
                                            maxLength={6}
                                            className="text-lg py-2"
                                        />
                                    </div>
                                    <button
                                        onClick={() => name.trim() && joinRoom(roomInput, name)}
                                        disabled={!name.trim() || roomInput.length !== 6}
                                        className="px-6 rounded-xl border border-white/10 hover:border-electric-cyan hover:bg-electric-cyan/10 transition-all disabled:opacity-30"
                                    >
                                        <Radio size={20} className="text-electric-cyan" />
                                    </button>
                                </div>

                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div
                                className="absolute bottom-8 px-6 py-3 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs tracking-widest flex items-center gap-2"
                            >
                                <Activity size={12} /> {error}
                            </div>
                        )}

                    </div>
                </section>

                {/* Right: Telemetry & Uplink */}
                <section className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                    <div className="glass-ethereal rounded-3xl flex-1 p-6 flex flex-col items-center justify-center relative bg-white/5">
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300 absolute top-6 left-6 flex items-center gap-2">
                            <Cpu size={14} className="text-neon-violet" />
                            Data Uplink
                        </div>

                        {roomId ? (
                            <div className="p-4 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                <QRCode value={`${window.location.origin}?room=${roomId}`} size={140} level="M" />
                            </div>
                        ) : (
                            <div className="w-40 h-40 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                                <QrCode size={32} className="text-white/20 animate-[spin_10s_linear_infinite_reverse]" />
                            </div>
                        )}

                        <div className="mt-8 w-full space-y-3">
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default Lobby;
