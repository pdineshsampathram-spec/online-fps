const Player = require('../models/Player');

// Simplified Room Manager: Just one global "lobby" room for now.
// Can be expanded to multiple rooms if required.
const players = new Map(); // socket.id -> Player

function addPlayer(socketId) {
  const player = new Player(socketId);
  players.set(socketId, player);
  return player;
}

function removePlayer(socketId) {
  players.delete(socketId);
}

function getPlayer(socketId) {
  return players.get(socketId);
}

function getAllPlayers() {
  return Array.from(players.values());
}

module.exports = {
  addPlayer,
  removePlayer,
  getPlayer,
  getAllPlayers,
};
