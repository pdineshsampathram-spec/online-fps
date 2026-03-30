const { handleMovement } = require('../game/playerManager');
const { handleHit } = require('../game/shooting');

function registerGameEvents(io, socket) {
  socket.on('playerMove', (data) => {
    handleMovement(socket, data);
  });

  socket.on('playerShoot', (data) => {
    // data => { targetId, damage }
    handleHit(io, socket.id, data.targetId, data.damage || 25);
  });
}

module.exports = { registerGameEvents };
