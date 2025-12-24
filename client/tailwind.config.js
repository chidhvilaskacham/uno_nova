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
            },
            keyframes: {
                'card-hover': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-20px)' },
                },
                'pop': {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
