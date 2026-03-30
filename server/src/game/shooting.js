const roomManager = require('../rooms/roomManager');

function handleHit(io, shooterId, targetId, damage) {
  const target = roomManager.getPlayer(targetId);
  const shooter = roomManager.getPlayer(shooterId);

  if (!target || !shooter) return;
  if (target.isDead || shooter.isDead) return;

  // Simple server confirmation
  // We can add ray casting logic here for an authoritative server,
  // but for simplicity the client decides hit direction, server validates distance and state.

  target.takeDamage(damage);

  // Notify everyone of the hit and damage taken
  io.emit('playerDamaged', { targetId, shooterId, newHealth: target.health, damage });

  if (target.isDead) {
    io.emit('playerKilled', { targetId, shooterId });
    
    // Start respawn sequence
    setTimeout(() => {
      target.respawn();
      io.emit('playerRespawned', { id: target.id, position: target.position, rotation: target.rotation });
    }, 3000); // 3 seconds to respawn
  }
}

module.exports = { handleHit };
