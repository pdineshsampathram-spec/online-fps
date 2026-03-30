import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import GameScene from '../scenes/GameScene';

// Use safe fallback wrappers preventing missing components from causing white screens
export default function GameCanvas() {
  return (
    <>
      <Suspense fallback={<div style={{ color: 'white', position: 'absolute', padding: 20 }}>Loading 3D Scene...</div>}>
        <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }} style={{ background: '#87CEEB', display: 'block' }}>
          <ambientLight intensity={0.5} />
          <directionalLight castShadow position={[10, 20, 10]} intensity={1.5} shadow-mapSize={[1024, 1024]} />
          
          <GameScene />
        </Canvas>
      </Suspense>
      
      {/* A static crosshair directly in HTML replaces the risky external React imports temporarily */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '4px', height: '4px', background: 'white', borderRadius: '50%', pointerEvents: 'none', zIndex: 10 }}></div>
    </>
  );
}
