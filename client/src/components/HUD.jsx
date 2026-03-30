import React, { useEffect, useState } from 'react';
import useGameStore from '../state/gameStore';
import { WEAPONS } from '../constants/weapons';
import { socket } from '../network/socket';
import MobileControls from './MobileControls';
import SettingsPanel from './SettingsPanel';

export default function HUD() {
  const health = useGameStore(state => state.health) || 100;
  const kills = useGameStore(state => state.kills) || 0;
  const players = useGameStore(state => state.players) || {};
  const roomId = useGameStore(state => state.roomId);
  const myId = useGameStore(state => state.myId);
  const hostId = useGameStore(state => state.hostId);
  const isHost = myId && hostId && myId === hostId;
  const resetStore = useGameStore(state => state.resetStore);
  
  const isDead = useGameStore(state => state.isDead);
  const matchPhase = useGameStore(state => state.matchPhase);
  const matchTimer = useGameStore(state => state.matchTimer) || 0;
  const countdown = useGameStore(state => state.countdown) || 0;
  const restartTimer = useGameStore(state => state.restartTimer) || 0;
  const zone = useGameStore(state => state.zone);
  const winner = useGameStore(state => state.winner);
  const localPlayerPos = useGameStore(state => state.localPlayerPos);
  const localPlayerYaw = useGameStore(state => state.localPlayerYaw) || 0;
  
  const setShowSettings = useGameStore(state => state.setShowSettings);
  
  const hitOpacity = useGameStore(state => state.hitMarkerOpacity);
  const hitColor = useGameStore(state => state.hitMarkerColor);
  const dmgOpacity = useGameStore(state => state.damageFlashOpacity);

  const weaponIndex = useGameStore(state => state.weaponIndex) || 0;
  const ammo = useGameStore(state => state.ammo) || 0;
  const isReloading = useGameStore(state => state.isReloading);
  const isZooming = useGameStore(state => state.isZooming);
  const currentWeapon = WEAPONS[weaponIndex] || WEAPONS[0];

  const mins = Math.floor(matchTimer / 60);
  const secs = (matchTimer % 60).toString().padStart(2, '0');
  
  const playerCount = Object.keys(players).length + 1;
  
  const fullPlayerList = [
    { id: 'YOU', kills, isLocal: true, color: '#00ffcc' },
    ...Object.values(players).map(p => ({ id: p.id.substring(0,5), kills: p.kills, color: p.color }))
  ].sort((a,b) => b.kills - a.kills);

  const sortedPlayers = fullPlayerList.slice(0, 5);

  const handleLeave = () => {
    socket.disconnect();
    resetStore();
    document.exitPointerLock(); 
  };
  
  const handleStartGame = () => {
    socket.emit('startGame');
  };

  // Explicit Debug Requirements
  console.log(`[DEBUG HUD] myId: ${myId} | hostId: ${hostId} | Phase: ${matchPhase}`);
  console.log(`[DEBUG HUD] Rotation Values - Yaw: ${localPlayerYaw}`);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', padding: '20px', color: 'white', textShadow: '2px 2px 4px black', fontFamily: 'monospace', fontSize: '1.2rem', boxSizing: 'border-box', zIndex: 100 }}>
      
      {/* Damage Flash Visually Overlaid Native Mapping */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `rgba(255, 0, 0, ${dmgOpacity})`, transition: 'background-color 0.1s' }} />

      {/* Scope Zoom Lens Overlay Explicitly Mapping Sniper Scopes Natively */}
      {isZooming && currentWeapon.name === 'Sniper' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'radial-gradient(circle, transparent 20%, #000 70%)', zIndex: 50 }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', background: 'rgba(0, 0, 0, 0.8)' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', width: '2px', height: '100%', background: 'rgba(0, 0, 0, 0.8)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '10px', height: '10px', background: 'red', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
        </div>
      )}

      {/* Crosshair & Headshot Native Evaluator */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: hitOpacity, transition: 'opacity 0.05s' }}>
          <div style={{ position: 'absolute', width: '2px', height: '24px', background: hitColor, transform: 'translate(-50%, -50%) rotate(45deg)', boxShadow: `0 0 5px ${hitColor}` }} />
          <div style={{ position: 'absolute', width: '2px', height: '24px', background: hitColor, transform: 'translate(-50%, -50%) rotate(-45deg)', boxShadow: `0 0 5px ${hitColor}` }} />
      </div>

      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '6px', height: '6px', background: 'white', opacity: matchPhase === 'playing' ? 0.8 : 0, borderRadius: '50%', boxShadow: '0 0 4px black' }} />

      {/* Central Announcement Mechanics Banners! */}
      {matchPhase === 'waiting' && (
        <div style={{ position: 'absolute', top: '30%', width: '100%', textAlign: 'center' }}>
          {isHost ? (
            <button onClick={handleStartGame} style={{ pointerEvents: 'auto', padding: '15px 40px', fontSize: '2.5rem', background: '#00ffcc', color: '#000', border: '5px solid #fff', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 30px #00ffcc' }}>
              Start Game
            </button>
          ) : (
            <div style={{ fontSize: '3rem', color: '#ffcc00', fontWeight: 'bold', textShadow: '0 0 10px #000' }}>
              Waiting for host...
            </div>
          )}
        </div>
      )}

      {matchPhase === 'starting' && (
        <div style={{ position: 'absolute', top: '30%', width: '100%', textAlign: 'center', fontSize: '5rem', color: '#ffcc00', fontWeight: 'bold', textShadow: '0px 0px 20px #ffcc00' }}>
          MATCH STARTING IN: {countdown}
        </div>
      )}

      {matchPhase === 'playing' && matchTimer > 115 && (
         <div style={{ position: 'absolute', top: '20%', width: '100%', textAlign: 'center', fontSize: '4rem', color: '#00ffcc', fontWeight: 'bold', opacity: 1 - ((120 - matchTimer)/5) }}>
            MATCH STARTED!
         </div>
      )}
      
      {/* Visual Podium Explicit Mechanics seamlessly! */}
      {matchPhase === 'ended' && (
        <div style={{ position: 'absolute', top: '20%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.8)', padding: '40px 0', border: '2px solid #00ffcc' }}>
          <h1 style={{ fontSize: '4rem', color: '#00ffcc', margin: 0 }}>MATCH OVER</h1>
          <div style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '30px' }}>Restarting in {restartTimer}s...</div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', height: '300px' }}>
            {/* 2nd Place */}
            {fullPlayerList[1] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '150px' }}>
                <span style={{ fontSize: '1.5rem', color: fullPlayerList[1].color, fontWeight: 'bold' }}>{fullPlayerList[1].id}</span>
                <span style={{ marginBottom: '10px' }}>{fullPlayerList[1].kills} Kills</span>
                <div style={{ width: '100%', height: '150px', background: 'silver', border: '2px solid #fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem', fontWeight: 'bold', color: 'black' }}>2</div>
              </div>
            )}
            
            {/* 1st Place */}
            {fullPlayerList[0] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '180px' }}>
                <span style={{ fontSize: '2rem', color: fullPlayerList[0].color, fontWeight: 'bold', textShadow: '0 0 10px gold' }}>{fullPlayerList[0].id}</span>
                <span style={{ marginBottom: '10px' }}>{fullPlayerList[0].kills} Kills</span>
                <div style={{ width: '100%', height: '220px', background: 'gold', border: '2px solid #fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '4rem', fontWeight: 'bold', color: 'black' }}>1</div>
              </div>
            )}

            {/* 3rd Place */}
            {fullPlayerList[2] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '150px' }}>
                <span style={{ fontSize: '1.2rem', color: fullPlayerList[2].color, fontWeight: 'bold' }}>{fullPlayerList[2].id}</span>
                <span style={{ marginBottom: '10px' }}>{fullPlayerList[2].kills} Kills</span>
                <div style={{ width: '100%', height: '100px', background: '#cd7f32', border: '2px solid #fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'black' }}>3</div>
              </div>
            )}
          </div>
        </div>
      )}

      {isDead && matchPhase === 'playing' && (
        <div style={{ position: 'absolute', top: '30%', width: '100%', textAlign: 'center', fontSize: '5rem', color: '#ff3333', fontWeight: 'bold', textShadow: '4px 4px 6px black' }}>
          YOU DIED<br/><span style={{ fontSize: '2rem', color: '#fff' }}>Respawning dynamically...</span>
        </div>
      )}

      {/* Complete UI Leaderboard */}
      <div style={{ position: 'absolute', top: 220, right: 20, width: '200px', background: 'rgba(0,0,0,0.5)', border: '1px solid #555', padding: '10px' }}>
         <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #fff', paddingBottom: '5px' }}>LEADERBOARD</h3>
         {sortedPlayers.map((p, i) => (
           <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: p.isLocal ? 'bold' : 'normal' }}>
             <span style={{ color: p.color }}>{p.id} {p.isLocal && '(YOU)'}</span><span>{p.kills}</span>
           </div>
         ))}
      </div>

      <button onClick={handleLeave} style={{ pointerEvents: 'auto', position: 'absolute', bottom: '100px', right: '40px', background: '#ff3333', color: 'white', border: '2px solid #fff', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '5px', fontSize: '1rem' }}>
        LEAVE MATCH
      </button>

      {/* Shrinking Zone Radars seamlessly structured mapping arrows dynamically indicating positional orientation! */}
      {localPlayerPos && (
        <div style={{ position: 'absolute', top: 20, right: 20, width: '180px', height: '180px', background: 'rgba(0,0,0,0.7)', border: '2px solid #555', borderRadius: '50%', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ position: 'absolute', left: '50%', width: '1px', height: '100%', background: 'rgba(255,255,255,0.2)' }} />
          
          {/* Explicit directional mapping rendering Math.sin and Math.cos implicitly relative to structural bounds! */}
          {(() => {
             // Inverting Y because in CSS 'Top' pushes downwards
             const directionX = Math.sin(localPlayerYaw) * 15;
             const directionY = -Math.cos(localPlayerYaw) * 15;
             return (
               <>
                 <div style={{ position: 'absolute', top: '50%', left: '50%', width: '8px', height: '8px', background: '#00ffcc', transform: 'translate(-50%, -50%)', borderRadius: '50%', zIndex: 5 }} />
                 <div style={{ position: 'absolute', top: `calc(50% + ${directionY}px)`, left: `calc(50% + ${directionX}px)`, width: '6px', height: '6px', background: '#fff', transform: 'translate(-50%, -50%)', borderRadius: '50%', boxShadow: '0 0 5px #fff', zIndex: 4 }} />
               </>
             );
          })()}

          {/* Scale Remote positions explicitly mapping relative offsets out of absolute world scales smoothly */}
          {Object.values(players).map(p => {
             if (p.id === myId) return null;
             
             if (!localPlayerPos) return null;
             
             const diffX = p.position.x - localPlayerPos.x;
             const diffZ = p.position.z - localPlayerPos.z;
             
             // 100 units diameter radar mapping 50 units max range inherently natively
             const viewRadius = 50; 
             if (Math.abs(diffX) > viewRadius || Math.abs(diffZ) > viewRadius) return null;

             const leftPct = 50 + (diffX / viewRadius) * 50;
             const topPct = 50 + (diffZ / viewRadius) * 50;

             return (
               <div key={p.id} style={{ position: 'absolute', left: `${leftPct}%`, top: `${topPct}%`, width: '8px', height: '8px', background: p.color || '#ff3333', transform: 'translate(-50%, -50%)', borderRadius: '50%', zIndex: 3 }} />
             );
          })}

          {/* Render Global Zone Native Ring explicitly inside radar! */}
          {zone && (() => {
             const zx = 50 + ((zone.x - localPlayerPos.x) * 2);
             const zz = 50 + ((zone.z - localPlayerPos.z) * 2);
             const radPct = zone.radius * 4; 
             return <div style={{ position: 'absolute', left: `${zx}%`, top: `${zz}%`, width: `${radPct}%`, height: `${radPct}%`, border: '2px solid red', background: 'rgba(255,0,0,0.1)', transform: 'translate(-50%, -50%)', borderRadius: '50%' }} />
          })()}
        </div>
      )}

      {/* Header Stat Bounds Native React Overlay */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.6)', padding: '15px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', width: '250px' }}>
        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>Room: <span style={{ color: '#00ffcc' }}>{roomId || "Not Connected"}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ color: '#00ffcc', fontWeight: 'bold', fontSize: '1.2rem' }}>{mins}:{secs}</div>
          <div style={{ color: '#ffcc00' }}>Players: {playerCount}</div>
        </div>
      </div>
      
      <button onClick={() => setShowSettings(true)} style={{ pointerEvents: 'auto', position: 'absolute', top: '20px', left: '290px', background: 'rgba(0,0,0,0.6)', color: '#00ffcc', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>
        ⚙️ SETTINGS
      </button>

      {/* Floating Dynamic Health Logic Bar */}
      <div style={{ position: 'absolute', bottom: '40px', left: '40px', background: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
        <div style={{ marginBottom: 10, fontWeight: 'bold', fontSize: '1.2rem' }}>HP: {health} / 100</div>
        <div style={{ width: '300px', height: '30px', border: '2px solid white', borderRadius: '5px', overflow: 'hidden', background: '#333' }}>
          <div style={{ height: '100%', width: `${Math.max(0, health)}%`, background: health > 30 ? '#4caf50' : '#f44336', transition: 'width 0.2s, background-color 0.2s' }} />
        </div>
      </div>
      
      {/* Active Weapon Interface Base */}
      <div style={{ position: 'absolute', bottom: '40px', right: '40px', background: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'right' }}>
        <div style={{ color: '#00ffcc', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '5px' }}>{currentWeapon.name}</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
           {isReloading ? <span style={{ color: 'orange' }}>RELOADING...</span> : <span>{ammo} <span style={{ fontSize: '1rem', color: '#999' }}>/ {currentWeapon.magSize}</span></span>}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '10px' }}>[1] AR  [2] Sniper  [3] SMG</div>
      </div>

      <MobileControls />
      <SettingsPanel />
    </div>
  );
}
