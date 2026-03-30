const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const setupSocketConnection = require('./sockets/connection');
const { startGameLoop } = require('./game/gameLoop');

const app = express();
const server = http.createServer(app);

// Use wildcard cors for local testing easily
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Setup sockets
setupSocketConnection(io);

// Start 20hz game loop
startGameLoop(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
