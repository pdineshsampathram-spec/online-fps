import React from 'react';
import { PointerLockControls } from '@react-three/drei';

export default function CameraController() {
  return (
    <PointerLockControls 
      // This will lock the mouse pointer to the canvas when clicked
      selector=".game-container" 
    />
  );
}
