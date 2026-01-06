import React, { useState, useEffect, useMemo } from 'react';
import { useSocket } from '../context/SocketContext';
import { Plus, Activity, ShieldCheck, Database, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBox from './Chat/ChatBox';
import EmoteMenu from './Chat/EmoteMenu';
import EmoteDisplay from './Chat/EmoteDisplay';

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

        // Update immediately
        updateProgress();

        const interval = setInterval(updateProgress, 100);
        return () => clearInterval(interval);
    }, [isActive, startTime, duration]);

    if (!isActive) return null;

    return (
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none overflow-visible z-0">
            <circle cx="50%" cy="50%" r="52%" fill="none" stroke="currentColor" strokeWidth="3"
                className={`transition-colors duration-300 ${progress < 30 ? 'text-red-500' : progress < 60 ? 'text-yellow-400' : 'text-green-500'}`}
                strokeDasharray="300"
                strokeDashoffset={300 - (300 * progress) / 100}
                strokeLinecap="round"
            />
        </svg>
    );
};

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
        red: 'bg-red-600 border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.6)]',
        blue: 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.6)]',
        green: 'bg-green-600 border-green-400 shadow-[0_0_20px_rgba(22,163,74,0.6)]',
        yellow: 'bg-yellow-500 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.6)]',
        wild: 'bg-zinc-900 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
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
                <div className="absolute top-3 left-4 font-black text-sm md:text-lg italic font-mono-aaa opacity-90 text-white shadow-black drop-shadow-md">
                    {displayValue[card.value] || card.value}
                </div>

                <div className={`
                    ${large ? 'w-24 h-36' : 'w-14 h-20 md:w-20 md:h-28'}
                    bg-white/10 backdrop-blur-md rounded-[50%] rotate-[-25deg] flex items-center justify-center border border-white/20
                    shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]
                `}>
                    <span className={`
                        ${large ? 'text-7xl' : 'text-3xl md:text-6xl'}
                        font-black italic rotate-[25deg] tracking-tighter text-white
                        ${card.color === 'wild' ? 'bg-gradient-to-r from-red-500 via-blue-500 to-green-500 text-transparent bg-clip-text' : ''}
                        drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]
                    `}>
                        {displayValue[card.value] || card.value}
                    </span>
                </div>

                <div className="absolute bottom-3 right-4 font-black text-sm md:text-lg italic font-mono-aaa rotate-180 opacity-90 text-white shadow-black drop-shadow-md">
                    {displayValue[card.value] || card.value}
                </div>
            </div>
        </motion.button>
    );
};

const ActionOverlay = ({ action }) => {
    if (!action) return null;

    const actionStyles = {
        skip: { text: 'SKIPPED', color: 'text-zinc-400', icon: '⊘', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
        reverse: { text: 'REVERSED', color: 'text-blue-400', icon: '⇄', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        draw2: { text: 'DRAW +2', color: 'text-red-400', icon: '+2', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        draw4: { text: 'DRAW +4', color: 'text-purple-400', icon: '+4', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        draw: { text: 'DREW CARD', color: 'text-zinc-400', icon: '+1', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
        system: { text: 'SYSTEM UPDATE', color: 'text-blue-400', icon: '⚡', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
    };

    const style = actionStyles[action.type] || { text: 'ACTION', color: 'text-white', icon: '!', bg: 'bg-white/10', border: 'border-white/20' };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -100 }}
            className={`
                pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]
                ${style.bg} backdrop-blur-3xl px-12 py-6 rounded-[3rem] border-2 ${style.border}
                flex flex-col items-center gap-4 shadow-[0_0_80px_rgba(0,0,0,0.5)]
            `}
        >
            <motion.div
                animate={{
                    rotate: action.type === 'reverse' ? [0, 180, 360] : 0,
                    scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`text-6xl font-black ${style.color}`}
            >
                {style.icon}
            </motion.div>
            <div className="text-center">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] block mb-1">{action.playerName || 'PLAYER'}</span>
                <span className={`text-4xl font-black italic tracking-tighter uppercase ${style.color}`}>
                    {action.type === 'system' ? action.message : style.text}
                </span>
            </div>
            {/* Plasma glint */}
            <div className="absolute inset-0 rounded-[3rem] overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
        </motion.div>
    );
};

const GameBoard = () => {
    const { gameState, players, socket, playCard, drawCard, playerName, winner, hand, isConnected, lastAction } = useSocket();
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedCardIndex, setSelectedCardIndex] = useState(null);
    const [lastActionTime, setLastActionTime] = useState(Date.now());
    const [currentOverlay, setCurrentOverlay] = useState(null);

    useEffect(() => {
        if (gameState) setLastActionTime(Date.now());
    }, [gameState?.currentCard, gameState?.currentPlayerIndex]);

    useEffect(() => {
        if (lastAction && lastAction.type !== 'play') {
            setCurrentOverlay(lastAction);
            const timer = setTimeout(() => setCurrentOverlay(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [lastAction]);

    if (!gameState) return null;

    const myIndex = players.findIndex(p => p.id === socket?.id);
    const activeColorGlow = {
        red: 'rgba(255, 50, 50, 0.4)',
        blue: 'rgba(0, 210, 255, 0.4)',
        green: 'rgba(50, 255, 50, 0.4)',
        yellow: 'rgba(255, 230, 0, 0.4)',
        wild: 'rgba(255, 255, 255, 0.2)'
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

    // --- Layout Logic ---
    const getPlayerPosition = (index, totalPlayers) => {
        // Calculate relative index: 0=Me, 1=Next, etc.
        const relativeIndex = (index - myIndex + totalPlayers) % totalPlayers;

        if (totalPlayers === 2) {
            // 2 Players: Me (Bottom), Opp (Top)
            if (relativeIndex === 0) return 'bottom';
            return 'top';
        }

        if (totalPlayers === 3) {
            // 3 Players: Me (Bottom), Opp1 (Left), Opp2 (Right)
            if (relativeIndex === 0) return 'bottom';
            if (relativeIndex === 1) return 'left';
            return 'right';
        }

        // 4 Players: Me (Bottom), Left, Top, Right
        const positions = ['bottom', 'left', 'top', 'right'];
        return positions[relativeIndex];
    };

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden flex items-center justify-center">
            <div className="stars-container" />
            <div className="nebula-glow nebula-blue" />
            <div className="nebula-glow nebula-red" />
            <div className={`fixed inset-0 pointer-events-none transition-colors duration-1000 opacity-20 z-0 bg-gradient-to-br ${gameState.currentColor === 'red' ? 'from-red-900/40 via-transparent' :
                gameState.currentColor === 'blue' ? 'from-blue-900/40 via-transparent' :
                    gameState.currentColor === 'green' ? 'from-green-900/40 via-transparent' :
                        'from-yellow-900/40 via-transparent'
                }`} />

            {/* ActionOverlay removed */}

            {/* --- HUD --- */}
            <div className="fixed top-8 left-12 z-50 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green pulse-status shadow-[0_0_10px_#39ff14]' : 'bg-neon-red shadow-[0_0_10px_#ff3131]'}`} />
                    <span className="text-[10px] font-black tracking-[0.5em] text-zinc-500 uppercase">System: Operational</span>
                </div>
                <div className="flex items-baseline gap-3">
                    <span className={`text-4xl font-black italic tracking-tighter uppercase transition-colors duration-1000 ${gameState.currentColor === 'red' ? 'text-red-500' :
                        gameState.currentColor === 'blue' ? 'text-blue-500' :
                            gameState.currentColor === 'green' ? 'text-green-500' : 'text-yellow-400'
                        }`}>#{gameState.currentColor} GRID</span>
                </div>
            </div>

            {/* --- CENTRAL ARENA --- */}
            <div className={`
                relative z-10 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full
                flex items-center justify-center
                border border-white/5 bg-white/5 backdrop-blur-sm
                shadow-[0_0_100px_rgba(0,0,0,0.5)]
                transition-all duration-1000
            `}>
                {/* Orbiting Turn Indicator */}
                <motion.div
                    animate={{ rotate: gameState.direction === 1 ? 360 : -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-white/20"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full backdrop-blur-md border border-white/20">
                        <Zap size={20} className={gameState.direction === 1 ? "text-blue-400" : "text-yellow-400"} fill="currentColor" />
                    </div>
                </motion.div>

                {/* Center Cluster */}
                <div className="flex items-center justify-center gap-8 relative z-20">
                    {/* Draw Pile */}
                    <motion.div
                        className="relative group cursor-pointer"
                        onClick={drawCard}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="w-24 h-36 md:w-32 md:h-48 glass-obsidian rounded-[1.5rem] border border-white/10 flex flex-col items-center justify-center gap-2 relative z-10">
                            <Plus size={32} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
                            <span className="text-[10px] font-black tracking-widest text-zinc-600 uppercase group-hover:text-white transition-colors">DRAW</span>
                        </div>
                    </motion.div>

                    {/* Discard Pile */}
                    <div className="relative w-24 h-36 md:w-32 md:h-48">
                        {/* Glow under discard */}
                        <motion.div
                            animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-[1.5rem] blur-xl bg-current opacity-40"
                            style={{ color: activeColorGlow[gameState.currentColor] }}
                        />
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={gameState.currentCard.id || 'discard'}
                                initial={{ opacity: 0, scale: 0.5, y: -100, rotate: Math.random() * 20 - 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0, rotate: Math.random() * 10 - 5 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="absolute inset-0"
                            >
                                <Card card={gameState.currentCard} large />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Plasma Ring Effect */}
                <div
                    className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-1000"
                    style={{ background: activeColorGlow[gameState.currentColor] }}
                />
            </div>

            {/* --- PLAYERS --- */}
            {players.map((player, index) => {
                const position = getPlayerPosition(index, players.length);
                const isActive = gameState.currentPlayerIndex === index;
                const isMe = player.id === socket?.id;

                // Positioning Styles
                let posStyles = {};
                let rotation = 0;
                let containerClass = "flex flex-col items-center gap-4";
                let cardContainerClass = "flex -space-x-12";
                let badgeClass = "glass-obsidian px-6 py-2 rounded-full border border-white/10 flex items-center gap-3";

                if (position === 'bottom') {
                    posStyles = { bottom: '2rem', left: '50%', transform: 'translateX(-50%)' };
                    rotation = 0;
                    containerClass = "flex flex-col-reverse items-center gap-6"; // Cards below handle? No, cards at bottom of screen usually.
                    // Actually for "My Hand", we want cards at the very bottom.
                    containerClass = "flex flex-col items-center gap-8";
                    cardContainerClass = "flex items-end justify-center -space-x-12 hover:-space-x-8 transition-all duration-300";
                } else if (position === 'top') {
                    posStyles = { top: '2rem', left: '50%', transform: 'translateX(-50%)' };
                    rotation = 180;
                    containerClass = "flex flex-col items-center gap-4";
                } else if (position === 'left') {
                    posStyles = { left: '2rem', top: '50%', transform: 'translateY(-50%)' };
                    rotation = 90;
                    containerClass = "flex flex-row items-center gap-4"; // Badge next to cards
                    cardContainerClass = "flex flex-col -space-y-16";
                } else if (position === 'right') {
                    posStyles = { right: '2rem', top: '50%', transform: 'translateY(-50%)' };
                    rotation = -90;
                    containerClass = "flex flex-row-reverse items-center gap-4";
                    cardContainerClass = "flex flex-col -space-y-16";
                }

                return (
                    <motion.div
                        key={player.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute z-20 pointer-events-none"
                        style={posStyles}
                    >
                        <div className={`${containerClass} pointer-events-auto`}>
                            {/* Hand */}
                            <div className={`${cardContainerClass} relative`} style={{ transform: `rotate(${rotation}deg)` }}>
                                {isMe ? (
                                    // MY HAND (Interactive)
                                    hand.map((card, i) => (
                                        <motion.div
                                            key={`my-card-${i}`}
                                            layout
                                            initial={{ y: 50, opacity: 0 }}
                                            animate={{
                                                opacity: 1,
                                                rotate: (i - (hand.length - 1) / 2) * 5, // Slight fan
                                                y: Math.abs(i - (hand.length - 1) / 2) * 10 // Arc effect
                                            }}
                                            whileHover={{ y: -40, rotate: 0, scale: 1.1, zIndex: 50 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className="origin-bottom"
                                        >
                                            <Card
                                                card={card}
                                                onClick={() => isActive && handleCardClick(i)}
                                                disabled={!isActive}
                                            />
                                        </motion.div>
                                    ))
                                ) : (
                                    // OPPONENT HAND (Static/Backs)
                                    Array.from({ length: Math.min(player.cardCount, 8) }).map((_, i) => (
                                        <div key={i} className="transform scale-75 lg:scale-90">
                                            <Card isOpponent />
                                        </div>
                                    ))
                                )}
                                {!isMe && player.cardCount > 8 && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-obsidian flex items-center justify-center border border-white/20 z-10 text-white font-black">
                                        +{player.cardCount - 8}
                                    </div>
                                )}
                            </div>

                            {/* Status Badge */}
                            <div className={`${badgeClass} ${isActive ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : ''}`}>
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center font-bold text-xs border border-white/10">
                                        {player.name.charAt(0)}
                                    </div>
                                    {isActive && (
                                        <div className="absolute -inset-1">
                                            <TimerRing isActive={true} startTime={gameState.turnStartTime} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400">{player.name}</span>
                                    <span className="text-xs font-black text-white">{player.cardCount} CARDS</span>
                                </div>
                                {player.cardCount === 1 && (
                                    <div className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded uppercase animate-bounce">
                                        UNO
                                    </div>
                                )}
                            </div>

                            {/* Emotes removed */}
                        </div>

                        {/* My Extra Controls removed */}
                    </motion.div>
                );
            })}

            {/* Color Picker Overlay */}
            <AnimatePresence>
                {showColorPicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center"
                    >
                        <div className="flex gap-8">
                            {['red', 'blue', 'green', 'yellow'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => pickColor(color)}
                                    className={`w-24 h-24 rounded-full border-4 border-white/20 transition-transform hover:scale-110 active:scale-95 shadow-[0_0_40px_currentColor]`}
                                    style={{ backgroundColor: color === 'yellow' ? '#facc15' : color }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Winner Screen */}
            <AnimatePresence>
                {winner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[200]"
                    >
                        <h1 className="text-6xl font-black text-white mb-8">{winner} WINS!</h1>
                        <button onClick={() => window.location.reload()} className="glass-obsidian px-8 py-4 rounded-full text-white font-bold hover:bg-white/10">
                            PLAY AGAIN
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <ChatBox />
        </div>
    );
};

export default GameBoard;
