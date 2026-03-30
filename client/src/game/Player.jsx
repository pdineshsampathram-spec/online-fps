import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
// import { useGLTF } from '@react-three/drei'; // Uncomment when loading real GLB files!

export default function Player({ position, rotation, state, color = "#ff0000", id, isLocal = false }) {
  const groupRef = useRef();
  const bodyRef = useRef();
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const gunRef = useRef();

  // Uncomment when real models are placed in the public folder:
  // const { scene } = useGLTF('/player.glb');
  // const { scene: gunScene } = useGLTF('/weapon.glb');

  // Destructure anim states passed from server securely!
  const isMoving = state?.isMoving || false;
  const isShooting = state?.isShooting || false;

  const animTime = useRef(Math.random() * 100);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Direct Position sync naturally handling multiplayer interpolation optionally
    groupRef.current.position.lerp(
      { x: position.x, y: position.y, z: position.z },
      0.3
    );

    // Direct Yaw Sync cleanly applying network orientation
    groupRef.current.rotation.y = rotation.yaw || 0;
    
    // Explicit Pitch sync exclusively mapped onto the head explicitly mapping aiming directions! 
    if (headRef.current) headRef.current.rotation.x = rotation.pitch || 0;

    animTime.current += delta;

    // Advanced Hierarchical Animations System natively applied resolving walking cycles flawlessly!
    if (isMoving) {
      const walkSpeed = 15;
      const t = animTime.current * walkSpeed;
      
      leftLegRef.current.rotation.x = Math.sin(t) * 0.5;
      rightLegRef.current.rotation.x = Math.sin(t + Math.PI) * 0.5;
      
      if (!isShooting) {
         leftArmRef.current.rotation.x = Math.sin(t + Math.PI) * 0.5;
         rightArmRef.current.rotation.x = Math.sin(t) * 0.5;
      }
      
      bodyRef.current.position.y = 1 + Math.abs(Math.sin(t)) * 0.05;
    } else {
      leftLegRef.current.rotation.x = 0;
      rightLegRef.current.rotation.x = 0;
      
      if (!isShooting) {
         leftArmRef.current.rotation.x = 0;
         rightArmRef.current.rotation.x = 0;
      }
      
      // Idle Breathing Bob seamlessly attached globally!
      bodyRef.current.position.y = 1 + Math.sin(animTime.current * 2) * 0.03;
    }

    // Shooting Stance Overrides explicitly aiming right arm natively handling pitch scales unconditionally!
    if (isShooting) {
      rightArmRef.current.rotation.x = (rotation.pitch || 0) - Math.PI/2; 
      leftArmRef.current.rotation.x = (rotation.pitch || 0) - Math.PI/2.5;
      
      // Artificial Recoil applied into the hierarchical bone locally!
      gunRef.current.position.z = 0.4 + Math.random() * 0.1;
      rightArmRef.current.rotation.z = Math.random() * 0.05;
    } else {
      // Return gun to resting position!
      gunRef.current.position.z = 0.4;
      rightArmRef.current.rotation.z = 0;
    }
  });

  // HIDE OWN PLAYER MODEL IN FPS VIEW AUTOMATICALLY natively mapped!
  if (isLocal) return null;

  return (
    <group ref={groupRef} userData={{ isPlayer: true, playerId: id }}>
      
      {/* Root Body Anchor Element */}
      <group ref={bodyRef} position={[0, 1, 0]}>
        
        {/* Core Torso */}
        <mesh name="body" castShadow receiveShadow position={[0, 0, 0]} userData={{ isPlayer: true, playerId: id, isBody: true }}>
          <boxGeometry args={[0.6, 0.8, 0.3]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Dynamic Pitching Head Element */}
        <group ref={headRef} position={[0, 0.55, 0]}>
           <mesh name="head" castShadow receiveShadow userData={{ isPlayer: true, playerId: id, isHead: true }}>
             <boxGeometry args={[0.3, 0.3, 0.3]} />
             <meshStandardMaterial color="#ffccaa" />
           </mesh>
           {/* Pseudo-visor/Eyes for directional rendering natively mapped! */}
           <mesh position={[0, 0.05, -0.16]}>
             <boxGeometry args={[0.2, 0.05, 0.05]} />
             <meshStandardMaterial color="#111" />
           </mesh>
        </group>

        {/* Left Arm hierarchical chain seamlessly attached globally! */}
        <group position={[-0.4, 0.3, 0]}>
          <group ref={leftArmRef} position={[0, -0.3, 0]}>
            <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
              <boxGeometry args={[0.15, 0.6, 0.15]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        </group>

        {/* Right Arm hierarchical chain (Holds Weapon!) */}
        <group position={[0.4, 0.3, 0]}>
          <group ref={rightArmRef} position={[0, -0.3, 0]}>
            <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
              <boxGeometry args={[0.15, 0.6, 0.15]} />
              <meshStandardMaterial color={color} />
            </mesh>
            
            {/* Attached Gun Pseudo-GLTF Component nested strictly inside Right Arm bone structures! */}
            <group ref={gunRef} position={[0, -0.4, -0.4]}>
               <mesh castShadow receiveShadow>
                 <boxGeometry args={[0.08, 0.08, 0.6]} />
                 <meshStandardMaterial color="#333" />
               </mesh>
            </group>
          </group>
        </group>

      </group>

      {/* Legs defined at root implicitly syncing relative scales! */}
      <group ref={leftLegRef} position={[-0.2, 0.5, 0]}>
        <mesh castShadow receiveShadow position={[0, -0.25, 0]}>
           <boxGeometry args={[0.2, 0.5, 0.2]} />
           <meshStandardMaterial color="#222" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.2, 0.5, 0]}>
        <mesh castShadow receiveShadow position={[0, -0.25, 0]}>
           <boxGeometry args={[0.2, 0.5, 0.2]} />
           <meshStandardMaterial color="#222" />
        </mesh>
      </group>

    </group>
  );
}
