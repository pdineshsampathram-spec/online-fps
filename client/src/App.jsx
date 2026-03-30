import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import useGameStore from './state/gameStore';
import { connectAndCreate, connectAndJoin } from './network/socket';

export default function App() {
  const isPlaying = useGameStore(state => state.isPlaying);
  const setIsPlaying = useGameStore(state => state.setIsPlaying);
  const [roomIdInput, setRoomIdInput] = useState('');

  const handleCreate = () => {
    connectAndCreate();
    setIsPlaying(true);
  };

  const handleJoin = () => {
    if (!roomIdInput) return;
    connectAndJoin(roomIdInput.toUpperCase());
    setIsPlaying(true);
  };

  if (!isPlaying) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#222', color: 'white', width: '100vw', height: '100vh', boxSizing: 'border-box' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Multiplayer FPS</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#333', padding: '2rem', borderRadius: '10px' }}>
          <button onClick={handleCreate} style={{ padding: '15px 30px', cursor: 'pointer', fontSize: '1.2rem', marginBottom: '1.5rem', background: '#4caf50', border: 'none', color: 'white', borderRadius: '5px', width: '100%' }}>Create New Room</button>
          
          <div style={{ margin: '10px 0', fontSize: '1.2rem', color: '#999' }}>— OR —</div>
          
          <div style={{ display: 'flex', marginTop: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Enter Room ID" 
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              style={{ padding: '15px', fontSize: '1.2rem', border: 'none', borderRadius: '5px 0 0 5px', width: '220px' }}
            />
            <button onClick={handleJoin} style={{ padding: '15px 30px', cursor: 'pointer', fontSize: '1.2rem', background: '#2196f3', border: 'none', color: 'white', borderRadius: '0 5px 5px 0' }}>Join Room</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}>
      {/* 3D Render Graphics Sub-Container */}
      <GameCanvas />
      
      {/* Absolute 2D Overlay Layout rendering strictly outside WebGL bounds safely */}
      <HUD />
    </div>
  );
}
