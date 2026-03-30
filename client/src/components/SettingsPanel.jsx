import React from 'react';
import useGameStore from '../state/gameStore';

export default function SettingsPanel() {
  const showSettings = useGameStore(state => state.showSettings);
  const setShowSettings = useGameStore(state => state.setShowSettings);
  const sensitivity = useGameStore(state => state.sensitivity);
  const setSensitivity = useGameStore(state => state.setSensitivity);
  const hudLayout = useGameStore(state => state.hudLayout);
  const setHudLayout = useGameStore(state => state.setHudLayout);

  if (!showSettings) return null;

  const updateLayout = (buttonName, property, value) => {
    setHudLayout({
      ...hudLayout,
      [buttonName]: {
        ...hudLayout[buttonName],
        [property]: Number(value)
      }
    });
  };

  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto',
      background: 'rgba(0,0,0,0.9)', border: '2px solid #00ffcc', borderRadius: '10px',
      padding: '20px', color: 'white', zIndex: 1000, pointerEvents: 'auto',
      fontFamily: 'monospace'
    }}>
      <h2 style={{ textAlign: 'center', color: '#00ffcc', marginTop: 0 }}>SETTINGS</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Sensitivity</h3>
        <input 
          type="range" min="0.0005" max="0.01" step="0.0001" 
          value={sensitivity} 
          onChange={(e) => setSensitivity(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ textAlign: 'right' }}>{sensitivity}</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>HUD Layout</h3>
        {Object.entries(hudLayout).map(([btnKey, config]) => (
          <div key={btnKey} style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px', color: '#ffcc00' }}>{btnKey}</div>
            
            {Object.entries(config).map(([prop, val]) => (
              <div key={prop} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ width: '80px' }}>{prop}</span>
                <input 
                  type="range" min="0" max={prop === 'size' ? 300 : 1000} step="5" 
                  value={val}
                  onChange={(e) => updateLayout(btnKey, prop, e.target.value)}
                  style={{ flex: 1, margin: '0 10px' }}
                />
                <span style={{ width: '40px', textAlign: 'right' }}>{val}px</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <button 
        onClick={() => setShowSettings(false)}
        style={{ width: '100%', padding: '15px', background: '#00ffcc', color: 'black', border: 'none', borderRadius: '5px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}
      >
        CLOSE
      </button>
    </div>
  );
}
