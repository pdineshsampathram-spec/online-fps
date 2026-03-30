import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Raycaster, Vector2 } from 'three';

export default function ShootingSystem() {
  const { camera, scene } = useThree();
  const [flashes, setFlashes] = useState([]);

  useEffect(() => {
    const handleShoot = (e) => {
      // 1. RequirePointerLock: Only allow shooting if the game is focused
      if (document.pointerLockElement === null) return;

      // 2. Raycaster Setup: Shoot from the absolute center
      const raycaster = new Raycaster();
      raycaster.setFromCamera(new Vector2(0, 0), camera);

      // 3. Detect Intersections
      const intersects = raycaster.intersectObjects(scene.children, true);

      // Filter out flashes so we don't shoot our own bullets
      const validHits = intersects.filter(hit => hit.object.name !== "flash");

      if (validHits.length > 0) {
        const hit = validHits[0];
        const hitPoint = hit.point.clone();
        
        // Use a unique ID string for React keys
        const id = `${Date.now()}-${Math.random()}`;

        // Add flash
        setFlashes(prev => [...prev, { id, position: hitPoint }]);

        // 4. Temporary Visual Effect: Remove the flash after ~80ms
        setTimeout(() => {
          setFlashes(prev => prev.filter(f => f.id !== id));
        }, 80);
      }
    };

    window.addEventListener('mousedown', handleShoot);
    return () => window.removeEventListener('mousedown', handleShoot);
  }, [camera, scene]);

  return (
    <>
      {flashes.map(flash => (
        <mesh 
          key={flash.id} 
          position={[flash.position.x, flash.position.y, flash.position.z]}
          name="flash"
        >
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      ))}
    </>
  );
}
