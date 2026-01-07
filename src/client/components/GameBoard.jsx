import React, { useState, useEffect, useMemo } from 'react';
import { useSocket } from '../context/SocketContext';
import { Plus, Activity, ShieldCheck, Database, Zap, Sparkles } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion'; // Removed as requested
import ChatBox from './Chat/ChatBox';

// Utility for native CSS animations
const MotionDiv = ({ children, className, style, animate, transition }) => (
    <div className={className} style={style}>
        {children}
    </div>
);

const TimerRing = ({ isActive, startTime, duration = 15000 }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!isActive || !startTime) {
            setProgress(100);
            return;
        }

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, duration - elapsed);
            const pct = (remaining / duration) * 100;
            setProgress(pct);
        };

        const interval = setInterval(updateProgress, 100);
        return () => clearInterval(interval);
    }, [isActive, startTime, duration]);

    if (!isActive) return null;

    return (
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none overflow-visible z-0">
            <circle cx="50%" cy="50%" r="52%" fill="none" stroke="currentColor" strokeWidth="2"
                className={`transition-all duration-300 ${progress < 30 ? 'text-neon-red' : progress < 60 ? 'text-yellow-400' : 'text-electric-cyan'} drop-shadow-[0_0_8px_currentColor]`}
                strokeDasharray="300"
                strokeDashoffset={300 - (300 * progress) / 100}
                strokeLinecap="round"
            />
        </svg>
    );
};

const Card = ({ card, onClick, disabled, isOpponent, large }) => {
    // Holographic/Foil effect styles
    const cardColors = {
        red: 'from-red-900/80 to-red-600/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
        blue: 'from-blue-900/80 to-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.4)]',
        green: 'from-green-900/80 to-green-600/20 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.4)]',
        yellow: 'from-yellow-900/80 to-yellow-600/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.4)]',
        wild: 'from-slate-900/90 to-black/80 border-electric-cyan/50 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
    };

    const displayText = {
        skip: '⊘',
        reverse: '⇄',
        draw2: '+2',
        draw4: '+4',
        wild: 'W'
    };

    if (isOpponent) {
        return (
            <div className={`
                ${large ? 'w-32 h-48' : 'w-16 h-24 md:w-20 md:h-32'}
                glass-ethereal rounded-xl relative overflow-hidden flex items-center justify-center
                border border-white/10 shadow-lg transform transition-transform duration-500
            `}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="text-electric-cyan text-opacity-30 font-light-geo tracking-[0.2em] -rotate-45 text-xs select-none">UNO NOVA</div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            </div>
        );
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                ${large ? 'w-40 h-60' : 'w-24 h-36 md:w-28 md:h-44'}
                relative rounded-2xl border p-1 transition-all duration-300 transform group
                ${disabled ? 'opacity-50 grayscale scale-95 cursor-not-allowed' : 'hover:-translate-y-6 hover:scale-110 active:scale-95 z-10 hover:z-50 cursor-pointer'}
                ${cardColors[card.color] || cardColors.wild}
                bg-gradient-to-br backdrop-blur-md
            `}
        >
            {/* Holographic Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

            <div className="w-full h-full rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Top Corner */}
                <span className="absolute top-2 left-2 text-white font-light-geo font-bold text-sm shadow-black drop-shadow-md">
                    {displayText[card.value] || card.value}
                </span>

                {/* Center Symbol */}
                <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner
                `}>
                    <span className={`
                        text-4xl font-light-geo font-bold italic text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]
                        ${card.color === 'wild' ? 'text-transparent bg-clip-text bg-gradient-to-r from-electric-cyan to-neon-violet' : ''}
                    `}>
                        {displayText[card.value] || card.value}
                    </span>
                </div>

                {/* Bottom Corner */}
                <span className="absolute bottom-2 right-2 text-white font-light-geo font-bold text-sm rotate-180 shadow-black drop-shadow-md">
                    {displayText[card.value] || card.value}
                </span>

                {/* Wild Effect */}
                {card.color === 'wild' && (
                    <div className="absolute inset-0 bg-electric-cyan/5 animate-pulse rounded-xl" />
                )}
            </div>
        </button>
    );
};

const GameBoard = () => {
    const { gameState, players, socket, playCard, drawCard, playerName, winner, hand, isConnected, lastAction } = useSocket();
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedCardIndex, setSelectedCardIndex] = useState(null);

    // --- Layout Logic ---
    const myIndex = players.findIndex(p => p.id === socket?.id);

    // Helper to determine positional layout
    const getPlayerPosition = (index, totalPlayers) => {
        const relativeIndex = (index - myIndex + totalPlayers) % totalPlayers;
        if (totalPlayers === 2) return relativeIndex === 0 ? 'bottom' : 'top';
        if (totalPlayers === 3) {
            if (relativeIndex === 0) return 'bottom';
            if (relativeIndex === 1) return 'left';
            return 'right';
        }
        const positions = ['bottom', 'left', 'top', 'right'];
        return positions[relativeIndex];
    };

    const handleCardClick = (index) => {
        const card = hand[index];
        if (card.color === 'wild') {
            setSelectedCardIndex(index);
            setShowColorPicker(true);
        } else {
            playCard(index);
        }
    };

    const pickColor = (color) => {
        playCard(selectedCardIndex, color);
        setShowColorPicker(false);
        setSelectedCardIndex(null);
    };

    if (!gameState) return <div className="h-screen flex items-center justify-center text-electric-cyan">SYNCING ORBIT...</div>;

    const activeColorHex = {
        red: '#ef4444',
        blue: '#3b82f6',
        green: '#22c55e',
        yellow: '#eab308',
        wild: '#b5179e'
    }[gameState.currentColor] || '#fff';

    return (
        <div className="relative h-screen w-full bg-[#020408] overflow-hidden flex items-center justify-center selection:bg-electric-cyan selection:text-black">
            {/* Backgrounds */}
            <div className="nebula-bg" />
            <div className="absolute inset-0 stars" />

            {/* Ambient Atmosphere based on Game Color */}
            <div
                className="absolute inset-0 transition-colors duration-1000 opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${activeColorHex}20 0%, transparent 70%)` }}
            />

            {/* --- HUD --- */}
            <div className="fixed top-6 left-8 z-50 flex flex-col gap-1">
                <div className="flex items-center gap-3 glass-ethereal px-4 py-2 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-electric-cyan shadow-[0_0_8px_#00f0ff]' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-[10px] font-light-geo tracking-[0.3em] text-white uppercase">
                        Link: {isConnected ? 'Stable' : 'Offline'}
                    </span>
                </div>
            </div>

            <div className="fixed top-6 right-8 z-50">
                <div className="text-right">
                    <div className="text-[10px] font-light-geo uppercase tracking-widest text-slate-400">Current Vector</div>
                    <div
                        className="text-2xl font-light-geo uppercase tracking-wider font-bold transition-colors duration-500 drop-shadow-md"
                        style={{ color: activeColorHex }}
                    >
                        {gameState.currentColor} SECTOR
                    </div>
                </div>
            </div>

            {/* --- CENTRAL PLAY ARENA --- */}
            <div className="relative z-10 w-[600px] h-[600px] rounded-full flex items-center justify-center">

                {/* Orbiting Ring Indicator */}
                <div className="absolute inset-0 rounded-full border border-dashed border-white/5 animate-[spin_60s_linear_infinite]" />
                <div
                    className="absolute inset-10 rounded-full border border-white/10 transition-all duration-1000"
                    style={{
                        transform: `rotate(${gameState.direction === 1 ? '0deg' : '180deg'})`,
                        boxShadow: `0 0 100px ${activeColorHex}10`
                    }}
                >
                    {/* Directional Particle */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black p-2 rounded-full border border-electric-cyan shadow-[0_0_15px_rgba(0,240,255,0.6)] z-20"
                    >
                        <Zap size={16} className="text-electric-cyan" fill="currentColor" />
                    </div>
                </div>

                {/* Center Content */}
                <div className="flex gap-8 items-center relative z-20">

                    {/* Draw Deck */}
                    <div
                        onClick={drawCard}
                        className="w-32 h-48 glass-ethereal rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:-translate-y-1 hover:border-electric-cyan/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-electric-cyan/20 transition-colors">
                            <Plus size={24} className="text-white group-hover:text-electric-cyan transition-colors" />
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 group-hover:text-white uppercase">Acquire</span>
                    </div>

                    {/* Discard Pile */}
                    <div className="relative w-32 h-48">
                        {/* Glow */}
                        <div
                            className="absolute inset-0 rounded-xl blur-xl opacity-40 animate-pulse"
                            style={{ backgroundColor: activeColorHex }}
                        />
                        <div className="absolute inset-0">
                            <Card card={gameState.currentCard} large disabled />
                        </div>
                    </div>
                </div>

            </div>

            {/* --- PLAYERS --- */}
            {players.map((player, index) => {
                const position = getPlayerPosition(index, players.length);
                const isActive = gameState.currentPlayerIndex === index;
                const isMe = player.id === socket?.id;

                let containerStyle = {};
                let rotationClass = "";

                if (position === 'bottom') containerStyle = { bottom: '2%', left: '50%', transform: 'translateX(-50%)' };
                else if (position === 'top') { containerStyle = { top: '5%', left: '50%', transform: 'translateX(-50%)' }; rotationClass = "rotate-180"; }
                else if (position === 'left') { containerStyle = { top: '50%', left: '5%', transform: 'translateY(-50%)' }; rotationClass = "rotate-90"; }
                else if (position === 'right') { containerStyle = { top: '50%', right: '5%', transform: 'translateY(-50%)' }; rotationClass = "-rotate-90"; }

                return (
                    <div key={player.id} className="absolute z-20 pointer-events-none" style={containerStyle}>
                        <div className={`pointer-events-auto flex flex-col items-center gap-4 ${rotationClass}`}>

                            {/* Opponent Badge / Status */}
                            <div className={`
                                glass-ethereal px-6 py-2 rounded-full flex items-center gap-4 transition-all duration-300
                                ${isActive ? 'border-electric-cyan shadow-[0_0_20px_rgba(0,240,255,0.3)] bg-electric-cyan/10' : 'border-white/10'}
                            `}>
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                                        {player.name.charAt(0)}
                                    </div>
                                    {isActive && (
                                        <div className="absolute -inset-1 rounded-full border border-electric-cyan/50 animate-ping" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-[10px] uppercase font-bold tracking-widest ${isActive ? 'text-electric-cyan' : 'text-slate-400'}`}>
                                        {player.name}
                                    </span>
                                    <span className="text-[10px] text-white font-mono opacity-80">{player.cardCount} UNITS</span>
                                </div>
                            </div>

                            {/* Hand Display */}
                            <div className="flex items-center justify-center -space-x-12 min-h-[100px]">
                                {isMe ? (
                                    <div className="flex -space-x-12 hover:-space-x-4 transition-all duration-500 py-4 px-2">
                                        {hand.map((card, i) => (
                                            <div key={i} className="transition-transform duration-300 hover:-translate-y-4" style={{ zIndex: i }}>
                                                <Card
                                                    card={card}
                                                    onClick={() => isActive && handleCardClick(i)}
                                                    disabled={!isActive}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    Array.from({ length: Math.min(player.cardCount, 6) }).map((_, i) => (
                                        <div key={i} className={`transform scale-75 origin-center ${i > 0 ? '' : ''}`}>
                                            <Card isOpponent />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Color Picker Modal */}
            {showColorPicker && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center">
                    <div className="glass-ethereal p-12 rounded-[3rem] flex items-center gap-8 border-none animate-[pop_0.3s_ease-out]">
                        {['red', 'blue', 'green', 'yellow'].map(color => (
                            <button
                                key={color}
                                onClick={() => pickColor(color)}
                                className="w-24 h-24 rounded-full border-4 border-white/20 hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_50px_currentColor] relative group"
                                style={{ backgroundColor: activeColorHex[color] || color }}
                            >
                                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Winner Overlay */}
            {winner && (
                <div className="fixed inset-0 bg-black/90 z-[200] flex flex-col items-center justify-center animate-[pop_0.5s_ease-out]">
                    <div className="text-electric-cyan text-sm uppercase tracking-[0.5em] mb-4 animate-pulse">Mission Complete</div>
                    <h1 className="text-8xl font-light-geo text-white mb-12 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                        {winner} <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-cyan to-neon-violet font-bold">WINS</span>
                    </h1>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-12 py-4 rounded-full btn-liquid text-white text-sm font-bold tracking-[0.2em] hover:scale-105 transition-transform"
                    >
                        RE-INITIALIZE
                    </button>
                </div>
            )}

            {/* Chat */}
            <ChatBox />
        </div>
    );
};

export default GameBoard;
