import React, { useRef, useEffect, useState } from 'react';
import useGameStore from '../state/gameStore';

export default function MobileControls() {
  const isMobile = 'ontouchstart' in window;
  const setMobileMove = useGameStore(state => state.setMobileMove);
  const setMobileLookDelta = useGameStore(state => state.setMobileLookDelta);
  const setMobileActions = useGameStore(state => state.setMobileActions);
  const mobileActions = useGameStore(state => state.mobileActions);
  const hudLayout = useGameStore(state => state.hudLayout);
  const shootButtonPos = useGameStore(state => state.shootButtonPos);
  const setShootButtonPos = useGameStore(state => state.setShootButtonPos);
  
  const joystickTouchId = useRef(null);
  const lookTouchId = useRef(null);
  
  const [joystickThumb, setJoystickThumb] = useState({ x: 0, y: 0 });
  const lastLookTouch = useRef(null);

  if (!isMobile) return null;

  const handleTouchStart = (e) => {
    // We handle look delta via a full screen invisible overlay and joystick via its own element
  };

  const handleTouchMove = (e) => {
    
  };

  const handleTouchEnd = (e) => {
    
  };

  // Right side of screen for camera look
  const handleLookStart = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (lookTouchId.current === null) {
            lookTouchId.current = touch.identifier;
            lastLookTouch.current = { x: touch.clientX, y: touch.clientY };
        }
    }
  };

  const handleLookMove = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === lookTouchId.current) {
            const deltaX = touch.clientX - lastLookTouch.current.x;
            const deltaY = touch.clientY - lastLookTouch.current.y;
            setMobileLookDelta({ x: deltaX, y: deltaY });
            
            // Immediately reset it in store after frame if needed, or we accumulate
            // Actually it's better to process it in PlayerController per frame using store
            
            lastLookTouch.current = { x: touch.clientX, y: touch.clientY };
        }
    }
  };

  const handleLookEnd = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === lookTouchId.current) {
            lookTouchId.current = null;
            lastLookTouch.current = null;
        }
    }
  };

  // Joystick handlers
  const handleJoystickStart = (e) => {
    e.stopPropagation();
    const touch = e.changedTouches[0];
    joystickTouchId.current = touch.identifier;
    updateJoystick(touch);
  };

  const handleJoystickMove = (e) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        updateJoystick(touch);
      }
    }
  };

  const handleJoystickEnd = (e) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        setJoystickThumb({ x: 0, y: 0 });
        setMobileMove({ x: 0, y: 0 });
      }
    }
  };

  const updateJoystick = (touch) => {
    const size = hudLayout.joystick.size;
    const center = { 
       x: window.innerWidth - (window.innerWidth - hudLayout.joystick.left) + size/2, 
       y: window.innerHeight - hudLayout.joystick.bottom - size/2 
    };
    // Re-calculate center based on DOM element is safer
    const touchElem = document.getElementById('joystick-base');
    if (!touchElem) return;
    const rect = touchElem.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxRadius = rect.width / 2;

    if (distance > maxRadius) {
      deltaX = (deltaX / distance) * maxRadius;
      deltaY = (deltaY / distance) * maxRadius;
    }

    setJoystickThumb({ x: deltaX, y: deltaY });

    // Normalize -1 to 1 for game move. Forward = negative Z.
    setMobileMove({ 
      x: deltaX / maxRadius, 
      y: -deltaY / maxRadius 
    });
  };

  const createBtnHandler = (action) => {
    return {
      onTouchStart: (e) => { 
        e.stopPropagation(); 
        console.log("TOUCH WORKING:", action); 
        setMobileActions({ [action]: true }); 
      },
      onTouchEnd: (e) => { e.stopPropagation(); setMobileActions({ [action]: false }); },
      onTouchCancel: (e) => { e.stopPropagation(); setMobileActions({ [action]: false }); }
    };
  };

  const handleShootDragStart = (e) => {
    e.stopPropagation();
    setMobileActions({ shoot: true });
    // Use look tracking logic to link Aim + Fire
    lastLookTouch.current = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  };

  const handleShootDragMove = (e) => {
    e.stopPropagation();
    const touch = e.changedTouches[0];
    if (lastLookTouch.current) {
      const deltaX = touch.clientX - lastLookTouch.current.x;
      const deltaY = touch.clientY - lastLookTouch.current.y;
      setMobileLookDelta({ x: deltaX, y: deltaY });
      lastLookTouch.current = { x: touch.clientX, y: touch.clientY };
    }
    // Update Drag Layout State dynamically as requested 
    setShootButtonPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleShootDragEnd = (e) => {
    e.stopPropagation();
    setMobileActions({ shoot: false });
    lastLookTouch.current = null;
  };

  return (
    <>
      {/* Look Area Overlay */}
      <div 
        style={{ position: 'absolute', top: 0, right: 0, width: '50vw', height: '100vh', zIndex: 10, pointerEvents: 'auto' }}
        onTouchStart={handleLookStart}
        onTouchMove={handleLookMove}
        onTouchEnd={handleLookEnd}
        onTouchCancel={handleLookEnd}
      />

      {/* Joystick */}
      <div 
        id="joystick-base"
        style={{ 
          position: 'absolute', 
          bottom: `${hudLayout.joystick.bottom}vh`, 
          left: `${hudLayout.joystick.left}vw`, 
          width: `clamp(70px, ${hudLayout.joystick.size}vw, 130px)`, 
          height: `clamp(70px, ${hudLayout.joystick.size}vw, 130px)`, 
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          zIndex: 20,
          touchAction: 'none',
          pointerEvents: 'auto'
        }}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '40%',
            height: '40%',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            transform: `translate(calc(-50% + ${joystickThumb.x}px), calc(-50% + ${joystickThumb.y}px))`,
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Action Buttons */}
      <div 
        onTouchStart={handleShootDragStart}
        onTouchMove={handleShootDragMove}
        onTouchEnd={handleShootDragEnd}
        onTouchCancel={handleShootDragEnd}
        style={{
          position: 'absolute', 
          left: shootButtonPos ? `${shootButtonPos.x - 30}px` : undefined,
          top: shootButtonPos ? `${shootButtonPos.y - 30}px` : undefined,
          bottom: shootButtonPos ? undefined : `${hudLayout.shootBtn.bottom}vh`, 
          right: shootButtonPos ? undefined : `${hudLayout.shootBtn.right}vw`, 
          width: `clamp(60px, ${hudLayout.shootBtn.size}vw, 100px)`, 
          height: `clamp(60px, ${hudLayout.shootBtn.size}vw, 100px)`,
          background: mobileActions.shoot ? 'rgba(255, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontWeight: 'bold', fontSize: '1rem', color: 'white',
          zIndex: 20,
          userSelect: 'none', touchAction: 'none', pointerEvents: 'auto'
        }}
      >
        SHOOT
      </div>

      <div 
        {...createBtnHandler('reload')}
        style={{
          position: 'absolute', 
          bottom: `${hudLayout.reloadBtn.bottom}vh`, 
          right: `${hudLayout.reloadBtn.right}vw`, 
          width: `clamp(45px, ${hudLayout.reloadBtn.size}vw, 80px)`, 
          height: `clamp(45px, ${hudLayout.reloadBtn.size}vw, 80px)`,
          background: mobileActions.reload ? 'rgba(255, 165, 0, 0.6)' : 'rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontWeight: 'bold', fontSize: '0.8rem', color: 'white',
          zIndex: 20,
          userSelect: 'none', touchAction: 'none', pointerEvents: 'auto'
        }}
      >
        RELOAD
      </div>

      <div 
        {...createBtnHandler('jump')}
        style={{
          position: 'absolute', 
          bottom: `${hudLayout.jumpBtn.bottom}vh`, 
          right: `${hudLayout.jumpBtn.right}vw`, 
          width: `clamp(45px, ${hudLayout.jumpBtn.size}vw, 80px)`, 
          height: `clamp(45px, ${hudLayout.jumpBtn.size}vw, 80px)`,
          background: mobileActions.jump ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontWeight: 'bold', fontSize: '0.9rem', color: 'white',
          zIndex: 20,
          userSelect: 'none', touchAction: 'none', pointerEvents: 'auto'
        }}
      >
        JUMP
      </div>

      <div 
        {...createBtnHandler('crouch')}
        style={{
          position: 'absolute', 
          bottom: `${hudLayout.crouchBtn.bottom}vh`, 
          right: `${hudLayout.crouchBtn.right}vw`, 
          width: `clamp(45px, ${hudLayout.crouchBtn.size}vw, 80px)`, 
          height: `clamp(45px, ${hudLayout.crouchBtn.size}vw, 80px)`,
          background: mobileActions.crouch ? 'rgba(0, 0, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontWeight: 'bold', fontSize: '0.8rem', color: 'white',
          zIndex: 20,
          userSelect: 'none', touchAction: 'none', pointerEvents: 'auto'
        }}
      >
        CROUCH
      </div>

      <div 
        {...createBtnHandler('scope')}
        style={{
          position: 'absolute', 
          bottom: `${hudLayout.scopeBtn.bottom}vh`, 
          right: `${hudLayout.scopeBtn.right}vw`, 
          width: `clamp(45px, ${hudLayout.scopeBtn.size}vw, 80px)`, 
          height: `clamp(45px, ${hudLayout.scopeBtn.size}vw, 80px)`,
          background: mobileActions.scope ? 'rgba(255, 255, 0, 0.6)' : 'rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontWeight: 'bold', fontSize: '0.8rem', color: 'black',
          zIndex: 20,
          userSelect: 'none', touchAction: 'none', pointerEvents: 'auto'
        }}
      >
        AIM
      </div>
    </>
  );
}
