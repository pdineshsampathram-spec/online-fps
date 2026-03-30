import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Euler, Raycaster, Vector2, Box3, MathUtils } from 'three';
import { socket } from '../network/socket';
import useGameStore from '../state/gameStore';
import { WEAPONS } from '../constants/weapons';
import { OBSTACLES } from '../constants/obstacles';
import { playSound } from './SoundSystem';

export default function PlayerController() {
  const { camera, gl, scene } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false, ctrl: false });
  
  const isTPP = useGameStore(state => state.isTPP);
  const setIsTPP = useGameStore(state => state.setIsTPP);
  const myId = useGameStore(state => state.myId);
  const isDead = useGameStore(state => state.isDead);
  const matchPhase = useGameStore(state => state.matchPhase);

  // Mobile inputs
  const mobileMove = useGameStore(state => state.mobileMove);
  const mobileLookDelta = useGameStore(state => state.mobileLookDelta);
  const mobileActions = useGameStore(state => state.mobileActions);
  const sensitivityStore = useGameStore(state => state.sensitivity);
  const setMobileLookDelta = useGameStore(state => state.setMobileLookDelta);


  const playerPos = useRef(new Vector3(0, 2, 25));
  const velocity = useRef(new Vector3(0, 0, 0));
  const isGrounded = useRef(false);
  const euler = useRef(new Euler(0, 0, 0, 'YXZ'));
  const cameraRecoil = useRef(new Vector2(0, 0));
  
  const [weaponIdx, setWeaponIdx] = useState(0);
  const weapon = WEAPONS[weaponIdx];
  const [ammoArr, setAmmoArr] = useState(WEAPONS.map(w => w.magSize));
  const isReloading = useRef(false);
  const isShooting = useRef(false);
  const lastShotTime = useRef(0);
  
  const currentEyeHeight = useRef(1.6);
  const isZoomingRef = useRef(false);
  
  const weaponRef = useRef();
  const bobTime = useRef(0);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const reload = () => {
    if (!isReloading.current && ammoArr[weaponIdx] < weapon.magSize) {
      isReloading.current = true;
      playSound('reload');
      useGameStore.setState({ isReloading: true }); 
      
      setTimeout(() => {
         setAmmoArr(prev => { const n = [...prev]; n[weaponIdx] = weapon.magSize; return n; });
         isReloading.current = false;
         useGameStore.setState({ isReloading: false });
      }, weapon.reloadTime);
    }
  };

  useEffect(() => {
    useGameStore.setState({ weaponIndex: weaponIdx, ammo: ammoArr[weaponIdx], isReloading: isReloading.current });
  }, [weaponIdx, ammoArr]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (['w','a','s','d'].includes(k)) keys.current[k] = true;
      if (e.key === ' ') keys.current.space = true;
      if (e.key === 'Shift') keys.current.shift = true;
      if (e.key === 'Control') keys.current.ctrl = true;
      if (k === 'c') keys.current.c = true;
      if (k === 'r' && matchPhase === 'playing') reload();
      if (['1','2','3'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (WEAPONS[idx]) { setWeaponIdx(idx); useGameStore.setState({ weaponIndex: idx, ammo: ammoArr[idx] }); }
      }
      if (k === 'f') setIsTPP(!isTPP);
    };
    
    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (['w','a','s','d'].includes(k)) keys.current[k] = false;
      if (e.key === ' ') keys.current.space = false;
      if (e.key === 'Shift') keys.current.shift = false;
      if (e.key === 'Control') keys.current.ctrl = false;
      if (k === 'c') keys.current.c = false;
    };

    const handleMouseMove = (e) => {
      if (document.pointerLockElement === gl.domElement) { 
        const sensitivity = sensitivityStore;
        euler.current.setFromQuaternion(camera.quaternion);
        euler.current.y -= e.movementX * sensitivity;
        euler.current.x -= e.movementY * sensitivity;
        euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
        camera.quaternion.setFromEuler(euler.current);
      }
    };

    const handleMouseDown = (e) => {
      const isMobile = 'ontouchstart' in window;
      if (!isMobile && document.pointerLockElement !== gl.domElement) {
        gl.domElement.requestPointerLock();
      } else { 
        if (e.button === 0) isShooting.current = true;
        if (e.button === 2 && weapon.zoomFov) { 
           useGameStore.setState({ isZooming: true });
           isZoomingRef.current = true;
        }
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 0) isShooting.current = false;
      if (e.button === 2) {
         useGameStore.setState({ isZooming: false });
         isZoomingRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
    };
  }, [camera, gl.domElement, scene, isTPP, setIsTPP, myId, isDead, matchPhase, weapon, ammoArr, weaponIdx]);

  const lastSync = useRef(0);

  useFrame((state, delta) => {
    const isShootingVal = isShooting.current || mobileActions.shoot;
    if (isShootingVal && matchPhase === 'playing' && !isReloading.current && ammoArr[weaponIdx] > 0 && !isDead) {
      const now = Date.now();
      if (now - lastShotTime.current > weapon.fireRate) {
        lastShotTime.current = now;
        
        playSound('shoot');
        setAmmoArr(prev => { const n = [...prev]; n[weaponIdx] -= 1; return n; });
        
        const recoilVal = weapon.recoil;
        cameraRecoil.current.x += recoilVal; 
        cameraRecoil.current.y += (Math.random() - 0.5) * recoilVal * 0.5; 
        
        const raycaster = new Raycaster();
        const spreadVec = new Vector2(
          (Math.random() - 0.5) * weapon.spread,
          (Math.random() - 0.5) * weapon.spread
        );
        raycaster.setFromCamera(spreadVec, camera);
        
        const intersects = raycaster.intersectObjects(scene.children, true);
        const hitPlayer = intersects.find(h => h.object.userData && h.object.userData.isPlayer);
        const hitGeom = intersects.find(h => !h.object.userData || !h.object.userData.isPlayer);

        let endPoint = camera.position.clone().add(raycaster.ray.direction.clone().multiplyScalar(200));
        let hitPlayerId = null;
        let isHeadshot = false;
        let finalDamage = weapon.damage;

        if (intersects.length > 0) {
          endPoint = Math.min(intersects[0].distance, 200) === intersects[0].distance ? intersects[0].point : endPoint;
          if (hitPlayer && (!hitGeom || hitPlayer.distance < hitGeom.distance) && hitPlayer.object.userData.playerId !== myId) {
            hitPlayerId = hitPlayer.object.userData.playerId;
            
            if (hitPlayer.object.name === 'head' || hitPlayer.object.userData.isHead) {
               isHeadshot = true;
               finalDamage = Math.floor(weapon.damage * (weapon.headMultiplier || 2));
            } else if (hitPlayer.object.name === 'body' || hitPlayer.object.userData.isBody) {
               finalDamage = weapon.damage;
            } else {
               finalDamage = Math.floor(weapon.damage * 0.8);
            }
          }
        }
        
        const startPoint = weaponRef.current ? weaponRef.current.getWorldPosition(new Vector3()) : camera.position;

        socket.emit('shoot', { 
          targetId: hitPlayerId,
          isHeadshot,
          damage: finalDamage,
          startP: { x: startPoint.x, y: startPoint.y, z: startPoint.z }, 
          endP: { x: endPoint.x, y: endPoint.y, z: endPoint.z } 
        });
      }
    }

    const canMove = !isDead;
    const isCrouching = keys.current.ctrl || keys.current.c || mobileActions.crouch;

    const SPEED = isCrouching ? 4 : (weapon.name === 'Sniper' ? 8 : 12); 
    const JUMP_FORCE = 8;
    const GRAVITY = 25;

    let moveVector = new Vector3(0,0,0);

    if (canMove) {
      const frontVector = new Vector3(0, 0, (keys.current.s ? 1 : 0) - (keys.current.w ? 1 : 0) - mobileMove.y);
      const sideVector = new Vector3((keys.current.a ? -1 : 0) + (keys.current.d ? 1 : 0) + mobileMove.x, 0, 0);

      const camDir = new Vector3();
      camera.quaternion.setFromEuler(euler.current);
      camera.getWorldDirection(camDir);
      camDir.y = 0; 
      camDir.normalize();

      const trueRightVector = new Vector3().crossVectors(camDir, camera.up).normalize();

      moveVector = new Vector3()
        .addScaledVector(camDir, -frontVector.z)
        .addScaledVector(trueRightVector, sideVector.x);
        
      if (moveVector.lengthSq() > 0) {
        moveVector.normalize().multiplyScalar(SPEED * delta);
      }
    }

    // AABB Box3 Collision Resolution natively sliding conditionally globally
    const nextPos = playerPos.current.clone().add(moveVector);
    const boxYOffset = 0.6; 
    const boxRadius = 0.35;
    
    const boxX = new Box3().setFromCenterAndSize(
       new Vector3(nextPos.x, playerPos.current.y + boxYOffset, playerPos.current.z),
       new Vector3(boxRadius * 2, 1.2, boxRadius * 2)
    );
    const boxZ = new Box3().setFromCenterAndSize(
       new Vector3(playerPos.current.x, playerPos.current.y + boxYOffset, nextPos.z),
       new Vector3(boxRadius * 2, 1.2, boxRadius * 2)
    );

    let canMoveX = true;
    let canMoveZ = true;

    for (const obs of OBSTACLES) {
       const obsBox = new Box3().setFromCenterAndSize(
          new Vector3(...obs.position),
          new Vector3(...obs.size)
       );
       if (boxX.intersectsBox(obsBox)) canMoveX = false;
       if (boxZ.intersectsBox(obsBox)) canMoveZ = false;
    }

    if (canMoveX) playerPos.current.x = nextPos.x;
    if (canMoveZ) playerPos.current.z = nextPos.z;

    if (canMove && (keys.current.space || mobileActions.jump) && isGrounded.current) {
      velocity.current.y = JUMP_FORCE;
      isGrounded.current = false;
    }

    velocity.current.y -= GRAVITY * delta;
    playerPos.current.y += velocity.current.y * delta;

    if (playerPos.current.y <= 1) { 
      playerPos.current.y = 1;
      velocity.current.y = 0;
      isGrounded.current = true;
    }

    const currentSpeed = new Vector2(velocity.current.x, velocity.current.z).length();
    if (Math.random() < 0.02) {
       console.log(`[DEBUG] isScoped: ${isZoomingRef.current} | Speed: ${currentSpeed.toFixed(2)} | Pos X: ${playerPos.current.x.toFixed(1)}`);
    }

    const targetEyeHeight = isCrouching ? 0.8 : 1.6;
    currentEyeHeight.current = MathUtils.lerp(currentEyeHeight.current, targetEyeHeight, 15 * delta);
    
    // Smooth camera visual recoil lerping natively decoupling matrices logically
    cameraRecoil.current.lerp(new Vector2(0, 0), 8 * delta);
    
    // Apply mobile look delta
    if (mobileLookDelta.x !== 0 || mobileLookDelta.y !== 0) {
      euler.current.y -= mobileLookDelta.x * sensitivityStore;
      euler.current.x -= mobileLookDelta.y * sensitivityStore;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      setMobileLookDelta({ x: 0, y: 0 }); // reset after applying
    }

    const targetEuler = euler.current.clone();
    targetEuler.x += cameraRecoil.current.x;
    targetEuler.y += cameraRecoil.current.y;
    targetEuler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetEuler.x));
    
    // Lerp FOV gracefully
    const isZoomingActive = isZoomingRef.current || mobileActions.scope;
    const targetFov = isZoomingActive && weapon.zoomFov ? weapon.zoomFov : 75;
    camera.fov = MathUtils.lerp(camera.fov, targetFov, 12 * delta);
    camera.updateProjectionMatrix();
    
    if (isTPP) {
      const offset = new Vector3(0, currentEyeHeight.current + 1, 4);
      offset.applyEuler(new Euler(0, euler.current.y, 0));
      camera.position.copy(playerPos.current).add(offset);
      camera.quaternion.setFromEuler(targetEuler);
    } else {
      camera.position.copy(playerPos.current);
      camera.position.y += currentEyeHeight.current;
      camera.quaternion.setFromEuler(targetEuler);
    }

    if (weaponRef.current) {
      weaponRef.current.position.copy(camera.position);
      weaponRef.current.quaternion.copy(camera.quaternion);

      if (!isTPP) {
        // Implement advanced procedural bobbing and recoil states
        weaponRef.current.position.copy(camera.position);
        weaponRef.current.quaternion.copy(camera.quaternion);
        
        // Gun positioning
        weaponRef.current.translateX(0.3);
        weaponRef.current.translateY(-0.3);
        weaponRef.current.translateZ(weapon.name==='Sniper' ? -0.9 : -0.7);
        
        // Shooting Recoil Visual Hook
        if (isShootingVal && !isReloading.current && ammoArr[weaponIdx] > 0 && !isDead) {
          weaponRef.current.translateZ(0.1); // Kickback inherently mapped!
          weaponRef.current.rotateX(0.05);
        }
        
        // Walking Bobbing Anim Hooks
        const isMovingInput = keys.current.w || keys.current.a || keys.current.s || keys.current.d || mobileMove.x !== 0 || mobileMove.y !== 0;
        if (canMove && isMovingInput) {
          bobTime.current += delta * (weapon.name==='SMG' ? 20 : 15);
          weaponRef.current.translateY(Math.sin(bobTime.current) * 0.03); 
          weaponRef.current.rotateZ(Math.cos(bobTime.current) * 0.01);
        } else {
          bobTime.current = 0;
        }
      }
    }

    useGameStore.setState({ localPlayerPos: playerPos.current, localPlayerYaw: euler.current.y });

    const now = Date.now();
    const isMoving = canMove && (keys.current.w || keys.current.a || keys.current.s || keys.current.d || mobileMove.x !== 0 || mobileMove.y !== 0);
    
    if (now - lastSync.current > 50) {
      socket.emit('move', { 
        position: playerPos.current, 
        rotation: { yaw: euler.current.y, pitch: euler.current.x },
        state: { isMoving, isShooting: isShootingVal }
      });
      lastSync.current = now;
    }
  });

  return (
    <>
      <mesh ref={weaponRef} visible={!isTPP && !isDead}>
        <boxGeometry args={weapon.name === 'Sniper' ? [0.1, 0.1, 0.9] : [0.15, 0.15, 0.5]} />
        <meshStandardMaterial color={weapon.color} />
      </mesh>
    </>
  );
}
