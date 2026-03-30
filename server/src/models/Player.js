class Player {
  constructor(id) {
    this.id = id;
    this.position = { x: 0, y: 1, z: 0 };
    this.rotation = { yaw: 0, pitch: 0 };
    this.health = 100;
    this.isDead = false;
    this.roomId = 'lobby'; // default room
  }

  updatePosition(pos) {
    if (this.isDead) return;
    this.position = { ...this.position, ...pos };
  }

  updateRotation(rot) {
    if (this.isDead) return;
    this.rotation = { ...this.rotation, ...rot };
  }

  takeDamage(amount) {
    if (this.isDead) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }
  }

  respawn() {
    this.health = 100;
    this.isDead = false;
    // Spawn randomly
    this.position = {
      x: (Math.random() - 0.5) * 10,
      y: 1, // slightly above ground
      z: (Math.random() - 0.5) * 10,
    };
    this.rotation = { yaw: 0, pitch: 0 };
  }
}

module.exports = Player;
