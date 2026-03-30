const roomManager = require('../rooms/roomManager');

function handleMovement(socket, data) {
  const player = roomManager.getPlayer(socket.id);
  if (player) {
    player.updatePosition(data.position);
    player.updateRotation(data.rotation);
  }
}

module.exports = { handleMovement };
