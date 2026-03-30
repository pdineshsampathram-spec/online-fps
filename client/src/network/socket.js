import { io } from 'socket.io-client';
import useGameStore from '../state/gameStore';
import { playSound } from '../game/SoundSystem';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const defaultUrl = isLocal ? 'http://localhost:3001' : 'https://online-fps.onrender.com';
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || defaultUrl;

export const socket = io(SOCKET_URL, { autoConnect: false });

socket.on("connect", () => {
  console.log("Connected:", socket.id, "to server:", SOCKET_URL);
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});

export const connectAndCreate = () => { socket.connect(); socket.emit('createRoom'); };
export const connectAndJoin = (roomId) => { socket.connect(); socket.emit('joinRoom', roomId); };

socket.on('roomCreated', (roomId) => {
  console.log("Room created:", roomId);
  useGameStore.getState().setRoomId(roomId);
  console.log("Current room:", useGameStore.getState().roomId);
});

socket.on('roomJoined', (roomId) => {
  console.log("Room joined:", roomId);
  useGameStore.getState().setRoomId(roomId);
});

socket.on('roomState', (data) => {
  useGameStore.getState().updateRoomState(data);
});

socket.on('playersUpdate', (data) => {
  const myId = socket.id;
  const store = useGameStore.getState();
  
  store.setMyId(myId);
  store.setRoomId(data.roomId);
  
  const me = data.players[myId];
  if (me) {
    store.setHealth(me.health);
    store.setKills(me.kills);
  }

  const otherPlayers = { ...data.players };
  delete otherPlayers[myId];
  store.setPlayers(otherPlayers);
});

socket.on('playerMoved', (data) => {
  useGameStore.getState().updatePlayerPosition(data.id, data.position, data.rotation);
});

socket.on('shootEffect', (data) => {
  const store = useGameStore.getState();
  store.addEffect({ type: 'tracer', start: data.startP, end: data.endP });
  if (data.spark) store.addEffect({ type: 'spark', position: data.endP });
});

socket.on('bloodEffect', (data) => {
  useGameStore.getState().addEffect({ type: 'blood', position: data.position });
});

socket.on('hitMarker', (data) => {
  useGameStore.getState().triggerHitMarker(data.isHeadshot);
  playSound('hit');
});

socket.on('damaged', (hp) => {
  useGameStore.getState().triggerDamageFlash();
});

socket.on('died', () => {
  const store = useGameStore.getState();
  store.setIsDead(true);
  store.setHealth(0);
  playSound('death');
});

socket.on('respawned', () => {
  useGameStore.getState().setIsDead(false);
});
