import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, LineCurve3, TubeGeometry } from 'three';
import useGameStore from '../state/gameStore';

function Tracer({ start, end, onDone }) {
  const ref = useRef();
  const [life, setLife] = useState(0);

  const geometry = useMemo(() => {
    const s = new Vector3(start.x, start.y, start.z);
    const e = new Vector3(end.x, end.y, end.z);
    const curve = new LineCurve3(s, e);
    return new TubeGeometry(curve, 10, 0.03, 4, false); 
  }, [start, end]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    setLife(l => l + delta);
    if (life > 0.15) { 
      ref.current.visible = false;
      onDone();
    } else {
      ref.current.material.opacity = 1 - (life / 0.15); 
    }
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshBasicMaterial color="#ffff55" transparent opacity={1} />
    </mesh>
  );
}

function ParticleBurst({ position, color, particleCount, gravity, lifespan, onDone }) {
  const groupRef = useRef();
  const [life, setLife] = useState(0);
  
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map(() => ({
      pos: new Vector3(position.x, position.y + (Math.random()*0.5), position.z),
      vel: new Vector3((Math.random()-0.5)*8, Math.random()*8, (Math.random()-0.5)*8)
    }));
  }, [position, particleCount]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    setLife(l => l + delta);
    if (life > lifespan) {
      onDone();
    } else {
      groupRef.current.children.forEach((child, i) => {
        particles[i].vel.y -= gravity * delta; 
        child.position.addScaledVector(particles[i].vel, delta);
        child.material.opacity = Math.max(0, 1 - (life / lifespan));
      });
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshBasicMaterial color={color} transparent />
        </mesh>
      ))}
    </group>
  );
}

export default function Effects() {
  const effects = useGameStore(state => state.effects);
  const removeEffect = useGameStore(state => state.removeEffect);

  return (
    <group>
      {effects.map(eff => {
        if (eff.type === 'tracer') {
          return <Tracer key={eff.id} start={eff.start} end={eff.end} onDone={() => removeEffect(eff.id)} />;
        }
        if (eff.type === 'blood') {
          return <ParticleBurst key={eff.id} position={eff.position} color="#cc0000" particleCount={15} gravity={25} lifespan={0.4} onDone={() => removeEffect(eff.id)} />;
        }
        if (eff.type === 'spark') {
          return <ParticleBurst key={eff.id} position={eff.position} color="#ffff00" particleCount={8} gravity={10} lifespan={0.2} onDone={() => removeEffect(eff.id)} />;
        }
        return null;
      })}
    </group>
  );
}
