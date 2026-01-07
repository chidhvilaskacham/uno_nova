/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'neon-red': '#ff3e3e',
                'neon-blue': '#00f2ff',
                'neon-green': '#39ff14',
                'deep-space': '#020408',
                'nebula-core': '#0f172a',
                'electric-cyan': '#00f0ff',
                'neon-violet': '#b5179e',
                'hologram-teal': '#4cc9f0',
                uno: {
                    red: '#ef4444',
                    blue: '#3b82f6',
                    green: '#22c55e',
                    yellow: '#eab308',
                    black: '#171717',
                }
            },
            animation: {
                'card-hover': 'card-hover 0.2s ease-out forwards',
                'pop': 'pop 0.3s ease-out forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scan': 'scan-vertical 2s linear infinite',
                'radar': 'radar-pulse 2s ease-out infinite',
                'flicker': 'flicker 3s linear infinite',
                'blink': 'blink 1s steps(2) infinite',
                'marquee': 'marquee 30s linear infinite',
            },
            keyframes: {
                'card-hover': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-20px)' },
                },
                'pop': {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'scan-vertical': {
                    '0%': { top: '0%' },
                    '100%': { top: '100%' },
                },
                'radar-pulse': {
                    '0%': { transform: 'scale(1)', opacity: '0.8' },
                    '100%': { transform: 'scale(2.5)', opacity: '0' },
                },
                'flicker': {
                    '0%, 19.9%, 22%, 62.9%, 64%, 64.9%, 70%, 100%': { opacity: '1' },
                    '20%, 21.9%, 63%, 63.9%, 65%, 69.9%': { opacity: '0.5' },
                },
                'blink': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
                'marquee': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            },
            boxShadow: {
                'glow-red': '0 0 20px rgba(255, 62, 62, 0.5), 0 0 40px rgba(255, 62, 62, 0.1)',
                'glow-blue': '0 0 20px rgba(0, 242, 255, 0.5), 0 0 40px rgba(0, 242, 255, 0.1)',
                'glow-green': '0 0 20px rgba(57, 255, 20, 0.5), 0 0 40px rgba(57, 255, 20, 0.1)',
                'glow-white': '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.1)',
            }
        },
    },
    plugins: [],
}
