import React from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';

const UnoApp = () => {
  const { gameState } = useSocket();

  return (
    <div className="min-h-screen">
      {!gameState ? <Lobby /> : <GameBoard />}
    </div>
  );
};

function App() {
  return (
    <SocketProvider>
      <UnoApp />
    </SocketProvider>
  );
}

export default App;
