import React, { useState, useEffect, useMemo } from 'react';
import { useSocket } from '../context/SocketContext';
import { Plus, Activity, ShieldCheck, Database, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Card = ({ card, onClick, disabled, isOpponent, large }) => {
    // Unique seed for each card's drift to prevent synchronized movement
    const driftSeed = useMemo(() => Math.random() * 10, []);

    if (isOpponent) {
        return (
            <motion.div
                animate={{
                    y: [0, -5, 0],
                    rotateZ: [0, 2, 0],
                }}
                transition={{
                    duration: 4 + driftSeed % 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: driftSeed
                }}
                className={`
                    ${large ? 'w-32 h-48' : 'w-20 h-32 md:w-24 md:h-36'}
                    glass-opponent rounded-[2rem] relative overflow-hidden flex items-center justify-center
                `}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center">
                    <span className="font-black italic text-3xl text-white opacity-20 tracking-[0.3em] font-mono-aaa select-none">UNO</span>
                </div>
                <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                <div className="holographic-glint" />
            </motion.div>
        );
    }

    const cardStyles = {
        red: 'bg-[#ef4444] border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
        blue: 'bg-[#3b82f6] border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
        green: 'bg-[#22c55e] border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]',
        yellow: 'bg-[#eab308] border-yellow-400/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]',
        wild: 'glass-obsidian border-white/20'
    };

    const displayValue = {
        skip: '⊘',
        reverse: '⇄',
        draw2: '+2',
        draw4: '+4',
        wild: 'W'
    };

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            layout
            animate={{
                y: [0, -8, 0],
                rotateZ: [0, 3, 0],
                rotateX: [0, 2, 0]
            }}
            transition={{
                y: { duration: 5 + driftSeed % 3, repeat: Infinity, ease: "easeInOut", delay: driftSeed },
                rotateZ: { duration: 7 + driftSeed % 4, repeat: Infinity, ease: "easeInOut", delay: driftSeed },
                rotateX: { duration: 6 + driftSeed % 2, repeat: Infinity, ease: "easeInOut", delay: driftSeed }
            }}
            whileHover={{
                scale: 1.25,
                zIndex: 100,
                y: -30,
                filter: "brightness(1.1)",
                transition: { type: "spring", stiffness: 400, damping: 15 }
            }}
            whileTap={{ scale: 0.95 }}
            className={`
                ${large ? 'w-32 h-48' : 'w-20 h-32 md:w-24 md:h-36'}
                relative rounded-[2rem] border-[1.5px] p-1
                ${cardStyles[card.color] || 'glass-obsidian border-white/10'}
                magnetic-card transition-all group
                ${disabled ? 'opacity-30 grayscale-[0.8]' : 'opacity-100'}
            `}
        >
            <div className="holographic-glint" />

            <div className={`w-full h-full rounded-[1.8rem] border border-white/20 flex flex-col items-center justify-center relative overflow-hidden ${card.color === 'wild' ? 'bg-white/2' : ''}`}>
                <div className="absolute top-3 left-4 font-black text-sm md:text-lg italic font-mono-aaa opacity-60 text-white">
                    {displayValue[card.value] || card.value}
                </div>

                <div className={`
                    ${large ? 'w-24 h-36' : 'w-14 h-20 md:w-20 md:h-28'}
                    bg-white/10 backdrop-blur-md rounded-[50%] rotate-[-25deg] flex items-center justify-center border border-white/20
                    shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]
                `}>
                    <span className={`
                        ${large ? 'text-7xl' : 'text-3xl md:text-6xl'}
                        font-black italic rotate-[25deg] tracking-tighter text-white
                        ${card.color === 'wild' ? 'bg-gradient-to-r from-red-500 via-blue-500 to-green-500 text-transparent bg-clip-text' : ''}
                        drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]
                    `}>
                        {displayValue[card.value] || card.value}
                    </span>
                </div>

                <div className="absolute bottom-3 right-4 font-black text-sm md:text-lg italic font-mono-aaa rotate-180 opacity-60 text-white">
                    {displayValue[card.value] || card.value}
                </div>
            </div>
        </motion.button>
    );
};

const GameBoard = () => {
    const { gameState, players, socket, playCard, drawCard, playerName, winner, hand, isConnected } = useSocket();
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedCardIndex, setSelectedCardIndex] = useState(null);
    const [lastActionTime, setLastActionTime] = useState(Date.now());

    useEffect(() => {
        if (gameState) setLastActionTime(Date.now());
    }, [gameState?.currentCard, gameState?.currentPlayerIndex]);

    if (!gameState) return null;

    const myIndex = players.findIndex(p => p.id === socket?.id);
    const myPlayer = players[myIndex];
    const otherPlayers = players.filter(p => p.id !== socket?.id);
    const isMyTurn = gameState.currentPlayerIndex === myIndex;

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

    const activeColorGlow = {
        red: 'rgba(255, 50, 50, 0.4)',
        blue: 'rgba(0, 210, 255, 0.4)',
        green: 'rgba(50, 255, 50, 0.4)',
        yellow: 'rgba(255, 230, 0, 0.4)',
        wild: 'rgba(255, 255, 255, 0.2)'
    };

    return (
        <div className="relative h-screen w-full flex flex-col items-center justify-between p-4 md:p-6 font-sans select-none bg-black overflow-hidden">
            <div className="stars-container" />
            <div className="nebula-glow nebula-blue" />
            <div className="nebula-glow nebula-red" />

            {/* Tactical Telemetry HUD */}
            <div className="fixed top-0 left-0 w-full p-8 flex justify-between items-start z-50 px-12">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green pulse-status shadow-[0_0_10px_#39ff14]' : 'bg-neon-red shadow-[0_0_10px_#ff3131]'}`} />
                        <span className="text-[10px] font-black tracking-[0.5em] text-zinc-500 uppercase">System: Operational</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <span className={`text-4xl font-black italic tracking-tighter uppercase transition-colors duration-1000 ${gameState.currentColor === 'red' ? 'text-red-500' :
                            gameState.currentColor === 'blue' ? 'text-blue-500' :
                                gameState.currentColor === 'green' ? 'text-green-500' : 'text-yellow-400'
                            }`}>#{gameState.currentColor} Grid</span>
                    </div>
                </div>

                <div className="flex gap-6">
                    <div key={`packet-${lastActionTime}`} className={`glass-obsidian px-6 py-3 rounded-2xl flex items-center gap-4 ${Date.now() - lastActionTime < 500 ? 'telemetry-pulse' : 'opacity-50'}`}>
                        <Database size={16} className="text-blue-400" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Packet Stability</span>
                            <span className="text-sm font-black font-mono-aaa text-white">99.98%</span>
                        </div>
                    </div>
                    <div key={`tflop-${lastActionTime}`} className={`glass-obsidian px-6 py-3 rounded-2xl flex items-center gap-4 ${Date.now() - lastActionTime < 500 ? 'telemetry-pulse' : 'opacity-50'}`}>
                        <Activity size={16} className="text-green-400" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Calculations</span>
                            <span className="text-sm font-black font-mono-aaa text-white">{(12.4 + Math.random()).toFixed(2)} TFLOPs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Opponent Clusters */}
            <div className="relative z-10 w-full pt-20">
                <div className="flex justify-center gap-16 md:gap-40 w-full px-4">
                    {otherPlayers.map((player) => {
                        const playerIndex = players.indexOf(player);
                        const isActive = gameState.currentPlayerIndex === playerIndex;
                        return (
                            <motion.div
                                key={player.id}
                                animate={{ opacity: isActive ? 1 : 0.3, scale: isActive ? 1.1 : 0.9 }}
                                className="flex flex-col items-center gap-10"
                            >
                                <div className="relative group/hand">
                                    <div className="flex -space-x-12 md:-space-x-20">
                                        {Array.from({ length: Math.min(player.cardCount, 5) }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="transform pointer-events-none"
                                                style={{ rotate: `${(i - (Math.min(player.cardCount, 5) - 1) / 2) * 12}deg` }}
                                            >
                                                <Card isOpponent />
                                            </div>
                                        ))}
                                    </div>
                                    {player.cardCount > 5 && (
                                        <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-obsidian flex items-center justify-center text-[10px] font-black text-white border-white/20">
                                            +{player.cardCount - 5}
                                        </div>
                                    )}
                                </div>
                                <div className={`flex items-center gap-4 px-8 py-2.5 rounded-full border transition-all duration-700 ${isActive ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_40px_rgba(0,210,255,0.2)]' : 'border-white/5 bg-transparent'}`}>
                                    <span className="font-black text-[11px] uppercase tracking-[0.4em] font-mono-aaa">{player.name}</span>
                                    <div className={`w-1 h-4 rounded-full ${isActive ? 'bg-blue-400 animate-pulse' : 'bg-zinc-800'}`} />
                                    <span className="text-sm font-black text-blue-400">{player.cardCount}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Gravity Well (Central Arena) */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-32 py-4">
                {/* Active Nebula Loop (Plasma Ring) */}
                <div
                    className="plasma-ring plasma-active transition-colors duration-1000"
                    style={{
                        background: `conic-gradient(from 0deg, ${activeColorGlow[gameState.currentColor]}, transparent, ${activeColorGlow[gameState.currentColor]})`
                    }}
                />

                {/* Draw Pile (Singularity) */}
                <motion.div
                    className="relative group cursor-pointer"
                    onClick={drawCard}
                    whileHover={{ scale: 1.05, filter: "brightness(1.5)" }}
                    whileTap={{ scale: 0.9 }}
                >
                    <div className="absolute -inset-12 bg-blue-500/10 blur-[60px] rounded-full animate-pulse" />
                    <div className="w-24 h-36 md:w-34 md:h-50 glass-obsidian rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center gap-5 relative z-10">
                        <Plus size={36} className="text-zinc-700 group-hover:text-blue-400 transition-colors" />
                        <span className="text-[9px] font-black tracking-[0.6em] text-zinc-700 uppercase group-hover:text-white transition-colors font-mono-aaa">Request</span>
                    </div>
                </motion.div>

                {/* Discard Pile (Dimensional Core) */}
                <div className="relative">
                    <motion.div
                        initial={false}
                        animate={{
                            boxShadow: `0 0 120px 30px ${activeColorGlow[gameState.currentColor]}`
                        }}
                        className="absolute inset-0 rounded-full blur-[120px] pointer-events-none"
                    />

                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={gameState.currentCard.id || JSON.stringify(gameState.currentCard)}
                            initial={{ scale: 2, opacity: 0, rotateZ: 360, y: -200 }}
                            animate={{ scale: 1.35, opacity: 1, rotateZ: 0, y: 0 }}
                            exit={{ scale: 0.5, opacity: 0, rotateZ: -360, y: 100 }}
                            transition={{ type: "spring", stiffness: 180, damping: 20 }}
                        >
                            <Card card={gameState.currentCard} large />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Pilot Directives (Player Hand) */}
            <div className="relative z-20 w-full flex flex-col items-center gap-14">
                <AnimatePresence>
                    {isMyTurn && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="glass-obsidian px-10 py-2.5 rounded-full border-yellow-500/30 shadow-[0_0_30px_rgba(255,230,0,0.1)] flex items-center gap-3"
                        >
                            <Zap size={14} className="text-yellow-400 animate-pulse" />
                            <span className="text-xs font-black italic tracking-[0.3em] text-yellow-400 uppercase">Input Terminal Ready</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    layout
                    className="flex justify-center flex-wrap gap-2 md:-space-x-14 px-12 max-w-[90vw] h-48 items-end pb-8"
                >
                    {hand.map((card, index) => (
                        <motion.div
                            key={`hand-card-${index}`}
                            layout
                            className="origin-bottom"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                        >
                            <Card
                                card={card}
                                onClick={() => isMyTurn && handleCardClick(index)}
                                disabled={!isMyTurn}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Coordinate Override (Color Picker) */}
            <AnimatePresence>
                {showColorPicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/85 backdrop-blur-2xl z-[100] flex items-center justify-center p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.85, rotateX: 20 }}
                            animate={{ scale: 1, rotateX: 0 }}
                            className="w-full max-w-sm glass-obsidian p-14 rounded-[4rem] space-y-12 border-white/10"
                        >
                            <div className="text-center space-y-4">
                                <h3 className="text-3xl font-black italic text-white tracking-tighter uppercase underline decoration-blue-500 decoration-8 underline-offset-8">Override Loop</h3>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono-aaa">Identify New Sector Destination</p>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                {['red', 'blue', 'green', 'yellow'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => pickColor(color)}
                                        className={`aspect-square rounded-[2.5rem] transition-all hover:scale-110 active:scale-90 border-8 border-black/40 ${color === 'red' ? 'bg-red-500 shadow-[0_0_30px_#ff3131]' :
                                            color === 'blue' ? 'bg-blue-500 shadow-[0_0_30px_#00f2ff]' :
                                                color === 'green' ? 'bg-green-500 shadow-[0_0_30px_#39ff14]' : 'bg-yellow-400 shadow-[0_0_30px_#ffea00]'
                                            }`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid Supremacy (Winner) */}
            <AnimatePresence>
                {winner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[200] flex flex-col items-center justify-center p-8 overflow-hidden"
                    >
                        <div className="stars-container opacity-100" />

                        {/* Victory Pop Particles */}
                        <div className="absolute inset-0 pointer-events-none">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <motion.div
                                    key={`pop-${i}`}
                                    initial={{
                                        x: "50%",
                                        y: "50%",
                                        scale: 0,
                                        opacity: 1
                                    }}
                                    animate={{
                                        x: `${Math.random() * 100}%`,
                                        y: `${Math.random() * 100}%`,
                                        scale: [0, 1.5, 0],
                                        opacity: [0, 1, 0],
                                        rotate: Math.random() * 360
                                    }}
                                    transition={{
                                        duration: 2 + Math.random() * 2,
                                        repeat: Infinity,
                                        delay: Math.random() * 2,
                                        ease: "easeOut"
                                    }}
                                    className={`absolute w-4 h-4 rounded-full blur-[2px] ${['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400'][i % 4]
                                        }`}
                                />
                            ))}
                        </div>

                        <motion.div
                            initial={{ y: 80, opacity: 0, scale: 0.5 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            className="relative z-10 flex flex-col items-center space-y-12"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="w-56 h-56 rounded-full border-4 border-blue-500/30 flex items-center justify-center bg-blue-500/10 shadow-[0_0_120px_rgba(0,210,255,0.4)]"
                            >
                                <ShieldCheck size={120} className="text-blue-400" />
                            </motion.div>

                            <div className="text-center space-y-4">
                                <motion.h1
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                    className="text-[10rem] font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-[0_0_60px_rgba(255,255,255,0.3)]"
                                >
                                    {winner} WON
                                </motion.h1>
                                <div className="space-y-4">
                                    <h2 className="text-blue-400 font-black font-mono-aaa tracking-[0.6em] text-4xl uppercase">
                                        SUCCESSFULLY
                                    </h2>
                                    <p className="text-white/60 font-black font-mono-aaa tracking-[0.4em] text-xl uppercase">
                                        Identity Sector: <span className="text-white">{winner}</span>
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(50, 255, 50, 0.2)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => window.location.reload()}
                                className="glass-obsidian px-24 py-6 text-2xl font-black tracking-[0.4em] rounded-full transition-all border-green-500/50 text-green-400 uppercase italic shadow-[0_0_40px_rgba(50,255,50,0.2)]"
                            >
                                Re-Link Matrix
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GameBoard;
