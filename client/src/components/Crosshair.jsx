import React from 'react';

export default function Crosshair() {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '4px',
      height: '4px',
      backgroundColor: 'white',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: 20,
      boxShadow: '0 0 2px black'
    }}>
      {/* Dynamic crosshair lines could go here */}
      <div style={{ position: 'absolute', top: -10, left: 1, width: 2, height: 8, background: 'white' }} />
      <div style={{ position: 'absolute', bottom: -10, left: 1, width: 2, height: 8, background: 'white' }} />
      <div style={{ position: 'absolute', left: -10, top: 1, width: 8, height: 2, background: 'white' }} />
      <div style={{ position: 'absolute', right: -10, top: 1, width: 8, height: 2, background: 'white' }} />
    </div>
  );
}
