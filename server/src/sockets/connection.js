const roomManager = require('../rooms/roomManager');
const { registerGameEvents } = require('./gameEvents');

function setupSocketConnection(io) {
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Add player to system
    const player = roomManager.addPlayer(socket.id);
    
    // Send welcome to the local player with their initial state
    socket.emit('joined', {
      id: player.id,
      position: player.position,
      rotation: player.rotation,
      health: player.health,
    });

    // Notify others
    socket.broadcast.emit('playerJoined', { id: player.id });

    // Register gameplay listeners
    registerGameEvents(io, socket);

    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      roomManager.removePlayer(socket.id);
      io.emit('playerLeft', { id: socket.id });
    });
  });
}

module.exports = setupSocketConnection;
