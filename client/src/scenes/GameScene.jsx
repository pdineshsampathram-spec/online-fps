import React from 'react';
import PlayerController from '../game/PlayerController';
import useGameStore from '../state/gameStore';
import Player from '../game/Player';
import Effects from '../game/Effects';
import { OBSTACLES } from '../constants/obstacles';
import * as THREE from 'three';

export default function GameScene() {
  const players = useGameStore(state => state.players || {});
  const zone = useGameStore(state => state.zone);

  return (
    <>
      <color attach="background" args={['#87CEEB']} />
      <fog attach="fog" args={['#aaccff', 30, 150]} />
      <ambientLight intensity={0.5} color="#ffd4a3" />
      <directionalLight 
         castShadow 
         position={[100, 150, 50]} 
         intensity={1.5} 
         color="#ffffff"
         shadow-mapSize={[2048, 2048]} 
         shadow-camera-left={-100} 
         shadow-camera-right={100} 
         shadow-camera-top={100} 
         shadow-camera-bottom={-100}
         shadow-camera-near={0.5}
         shadow-camera-far={500}
         shadow-bias={-0.0001}
      />
      
      <Effects />
      <PlayerController />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#4d5a37" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Shrinking Zone Visual Boundary strictly bounds safely bypassing standard Lighting! */}
      {zone && (
        <mesh position={[zone.x, 50, zone.z]} renderOrder={-1}>
          <cylinderGeometry args={[zone.radius, zone.radius, 100, 64, 1, true]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}

      {OBSTACLES.map((obs, i) => (
        <mesh key={i} castShadow receiveShadow position={obs.position} userData={{ isObstacle: true }}>
          <boxGeometry args={obs.size} />
          <meshStandardMaterial color={obs.color || "#aaaaaa"} roughness={0.7} metalness={0.2} />
        </mesh>
      ))}

      {Object.values(players).map(p => (
        <Player key={p.id} id={p.id} position={p.position} rotation={p.rotation} color={p.color} />
      ))}
    </>
  );
}
