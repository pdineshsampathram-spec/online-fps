const { getAllPlayers } = require('../rooms/roomManager');

// Target 20hz tick rate (50ms per tick)
const TICK_RATE = 20;
const TICK_TIME = 1000 / TICK_RATE;

function startGameLoop(io) {
  setInterval(() => {
    // Collect snapshot of game state
    const players = getAllPlayers();
    
    // Convert to simplified structure to send over network
    const gameState = players.map(p => ({
      id: p.id,
      position: p.position,
      rotation: p.rotation,
      health: p.health,
      isDead: p.isDead,
    }));

    // Broadcast state to all players
    io.emit('gameTick', gameState);

  }, TICK_TIME);
}

module.exports = { startGameLoop };
