import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SocketProvider, useSocket } from './context/SocketContext';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';

const UnoApp = () => {
  const { gameState } = useSocket();

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {!gameState ? <Lobby /> : <GameBoard />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <SocketProvider>
              <UnoApp />
            </SocketProvider>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
