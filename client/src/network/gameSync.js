import { socket } from './socket';
import useGameStore from '../state/gameStore';

export function setupNetworkListeners() {
  socket.on('joined', (data) => {
    useGameStore.getState().setMyId(data.id);
    useGameStore.getState().setHealth(data.health);
    useGameStore.getState().setJoined(true);
  });

  socket.on('gameTick', (players) => {
    const myId = useGameStore.getState().myId;
    // Filter out our own player from the remote players array
    const remotePlayers = players.filter(p => p.id !== myId);
    useGameStore.getState().setPlayers(remotePlayers);
  });

  socket.on('playerDamaged', (data) => {
    if (data.targetId === useGameStore.getState().myId) {
      useGameStore.getState().setHealth(data.newHealth);
    }
  });

  socket.on('playerKilled', (data) => {
    if (data.targetId === useGameStore.getState().myId) {
      useGameStore.getState().setHealth(0);
    }
  });

  socket.on('playerRespawned', (data) => {
    if (data.id === useGameStore.getState().myId) {
      useGameStore.getState().setHealth(100);
    }
  });
}
