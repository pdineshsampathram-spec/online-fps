import { create } from 'zustand';

const useGameStore = create((set) => ({
  isPlaying: false,
  myId: null,
  roomId: null,
  hostId: null,
  health: 100,
  kills: 0,
  players: {}, 
  isTPP: false,
  isDead: false,
  localPlayerPos: null,

  matchPhase: 'waiting', 
  countdown: 0,
  matchTimer: 120,
  restartTimer: 15,
  zone: null,
  winner: null,
  
  weaponIndex: 0,
  ammo: 30,
  isReloading: false,
  isZooming: false,
  
  // Mobile controls state
  mobileMove: { x: 0, y: 0 },
  mobileLookDelta: { x: 0, y: 0 },
  mobileActions: { shoot: false, jump: false, crouch: false, reload: false },
  
  // Settings state
  sensitivity: 0.008,
  showSettings: false,
  hudLayout: {
    joystick: { bottom: 15, left: 5, size: 30 },
    shootBtn: { bottom: 15, right: 5, size: 20 },
    reloadBtn: { bottom: 38, right: 5, size: 15 },
    jumpBtn: { bottom: 40, right: 25, size: 15 },
    crouchBtn: { bottom: 15, right: 30, size: 15 },
    scopeBtn: { bottom: 60, right: 25, size: 15 },
  },
  
  effects: [],
  hitMarkerOpacity: 0,
  hitMarkerColor: 'white',
  damageFlashOpacity: 0,

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setMyId: (myId) => set({ myId }),
  setRoomId: (roomId) => set({ roomId }),
  setHealth: (health) => set({ health }),
  setKills: (kills) => set({ kills }),
  setPlayers: (players) => set({ players }),
  setIsTPP: (isTPP) => set({ isTPP }),
  setIsDead: (isDead) => set({ isDead }),
  
  setMobileMove: (mobileMove) => set({ mobileMove }),
  setMobileLookDelta: (mobileLookDelta) => set({ mobileLookDelta }),
  setMobileActions: (actions) => set(s => ({ mobileActions: { ...s.mobileActions, ...actions } })),
  shootButtonPos: null,
  setShootButtonPos: (pos) => set({ shootButtonPos: pos }),
  setSensitivity: (sensitivity) => set({ sensitivity }),
  setShowSettings: (showSettings) => set({ showSettings }),
  setHudLayout: (hudLayout) => set({ hudLayout }),
  
  updateRoomState: (data) => set({ 
    matchPhase: data.phase, 
    countdown: data.countdown, 
    matchTimer: data.timer, 
    zone: data.zone, 
    winner: data.winner, 
    restartTimer: data.restartTimer,
    hostId: data.hostId || null
  }),

  triggerHitMarker: (isHeadshot) => {
    set({ hitMarkerOpacity: 1, hitMarkerColor: isHeadshot ? 'red' : 'white' });
    setTimeout(() => set({ hitMarkerOpacity: 0 }), 150);
  },
  triggerDamageFlash: () => {
    set({ damageFlashOpacity: 0.5 });
    setTimeout(() => set({ damageFlashOpacity: 0 }), 300);
  },

  addEffect: (effect) => set(s => ({ effects: [...s.effects, { id: Date.now() + Math.random(), ...effect }] })),
  removeEffect: (id) => set(s => ({ effects: s.effects.filter(e => e.id !== id) })),
  
  updatePlayerPosition: (id, position, rotation) => set((state) => {
    if (!state.players[id]) return state; 
    return {
      players: {
        ...state.players,
        [id]: { ...state.players[id], position, rotation }
      }
    };
  }),

  // Advanced Disconnect Restorer mapping states directly securely globally seamlessly
  resetStore: () => set({
    isPlaying: false,
    myId: null,
    roomId: null,
    hostId: null,
    health: 100,
    kills: 0,
    players: {},
    isDead: false,
    matchPhase: 'waiting',
    isZooming: false
  })
}));

export default useGameStore;
