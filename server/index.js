const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: "*", 
    methods: ['GET', 'POST'] 
  } 
});

const rooms = {}; 
const playerToRoom = {}; 

const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const initRoom = (roomId) => {
  rooms[roomId] = {
    id: roomId,
    players: {},
    phase: 'waiting', 
    countdown: 3,
    timer: 300, 
    restartTimer: 15,
    zone: { x: 0, z: 0, radius: 100 },
    winner: null,
    hostId: null
  };
};

io.on('connection', (socket) => {
  console.log(`Connection established: ${socket.id}`);

  const joinOrCreate = (roomId) => {
    socket.join(roomId);
    let isNew = false;
    if (!rooms[roomId]) { 
      initRoom(roomId); 
      rooms[roomId].hostId = socket.id;
      isNew = true; 
    }
    
    rooms[roomId].players[socket.id] = {
      id: socket.id,
      position: { x: (Math.random() - 0.5) * 40, y: 1, z: (Math.random() - 0.5) * 40 },
      rotation: { yaw: 0, pitch: 0 },
      health: 100,
      kills: 0,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      lastHitTime: 0
    };
    
    playerToRoom[socket.id] = roomId;

    if (isNew) {
      socket.emit("roomCreated", roomId);
    } else {
      socket.emit("roomJoined", roomId);
    }

    io.to(roomId).emit('roomState', { phase: rooms[roomId].phase, countdown: rooms[roomId].countdown, timer: rooms[roomId].timer, zone: rooms[roomId].zone, hostId: rooms[roomId].hostId });
    io.to(roomId).emit('playersUpdate', { roomId, players: rooms[roomId].players });
  };

  socket.on('startGame', () => {
    const roomId = playerToRoom[socket.id];
    if (roomId && rooms[roomId]) {
      const room = rooms[roomId];
      if (room.hostId === socket.id && room.phase === 'waiting') {
        room.phase = 'starting';
        room.countdown = 3;
        io.to(roomId).emit('roomState', { phase: room.phase, countdown: room.countdown, timer: room.timer, zone: room.zone, hostId: room.hostId });
      }
    }
  });

  socket.on('createRoom', () => joinOrCreate(generateRoomId()));
  socket.on('joinRoom', (roomId) => {
    if (rooms[roomId] && Object.keys(rooms[roomId].players).length > 0) joinOrCreate(roomId);
    else socket.emit('error', 'Room not found');
  });

  socket.on('move', (data) => {
    const roomId = playerToRoom[socket.id];
    if (roomId && rooms[roomId] && rooms[roomId].players[socket.id]) {
      const p = rooms[roomId].players[socket.id];
      if (p.health > 0) {
        p.position = data.position;
        p.rotation = data.rotation;
        socket.to(roomId).emit('playerMoved', { id: socket.id, ...data });
      }
    }
  });

  socket.on('shoot', (data) => {
    const roomId = playerToRoom[socket.id];
    if (roomId && rooms[roomId] && rooms[roomId].phase === 'playing') {
      const room = rooms[roomId];
      io.to(roomId).emit('shootEffect', { startP: data.startP, endP: data.endP, spark: data.targetId == null });

      if (data.targetId && room.players[data.targetId] && room.players[socket.id]) {
        const p = room.players[data.targetId];
        
        // Anti-Spam Hit Cooldown bounds natively applied limiting DPS reliably
        const now = Date.now();
        if (now - p.lastHitTime < 300) return; 
        p.lastHitTime = now;

        if (p.health > 0) { 
          const finalDamage = data.damage || 40;
          p.health -= finalDamage;
          
          io.to(roomId).emit('bloodEffect', { position: data.endP });
          io.to(data.targetId).emit('damaged', p.health);
          io.to(socket.id).emit('hitMarker', { isHeadshot: data.isHeadshot });

          if (p.health <= 0) {
            p.health = 0;
            room.players[socket.id].kills += 1;
            io.to(data.targetId).emit('died'); 

            setTimeout(() => {
              if (rooms[roomId] && rooms[roomId].players[data.targetId]) {
                const spwn = rooms[roomId].players[data.targetId];
                spwn.health = 100;
                spwn.position = { x: room.zone.x + (Math.random()-0.5)*(room.zone.radius*0.8), y: 2, z: room.zone.z + (Math.random()-0.5)*(room.zone.radius*0.8) };
                io.to(roomId).emit('playersUpdate', { roomId, players: rooms[roomId].players });
                io.to(data.targetId).emit('respawned');
              }
            }, 3000);
          }
          io.to(roomId).emit('playersUpdate', { roomId, players: room.players });
        }
      }
    }
  });

  socket.on('disconnect', () => {
    const roomId = playerToRoom[socket.id];
    if (roomId && rooms[roomId]) {
      const room = rooms[roomId];
      delete room.players[socket.id];
      delete playerToRoom[socket.id];
      const remainingPlayers = Object.keys(room.players);

      if (remainingPlayers.length === 0) {
        delete rooms[roomId];
      } else {
        if (room.hostId === socket.id) {
          room.hostId = remainingPlayers[0];
          io.to(roomId).emit('roomState', { phase: room.phase, countdown: room.countdown, timer: room.timer, zone: room.zone, hostId: room.hostId });
        }
        io.to(roomId).emit('playersUpdate', { roomId, players: rooms[roomId].players });
      }
    }
  });
});

setInterval(() => {
  for (const roomId in rooms) {
    const room = rooms[roomId];

    if (room.phase === 'waiting') {
       // Awaiting Host explicitly triggering startGame natively! 
    } else if (room.phase === 'starting') {
      room.countdown -= 1;
      if (room.countdown <= 0) {
         room.phase = 'playing';
         room.timer = 120; // 2 Min match structure explicitly mapped
      }
      io.to(roomId).emit('roomState', { phase: room.phase, countdown: room.countdown, timer: room.timer, zone: room.zone, hostId: room.hostId });

    } else if (room.phase === 'playing') {
      room.timer -= 1;
      if (room.zone.radius > 10) room.zone.radius -= 0.5; 
      
      let needsStatePush = false;
      for (const pId in room.players) {
        const p = room.players[pId];
        if (p.health > 0) {
          const dx = p.position.x - room.zone.x;
          const dz = p.position.z - room.zone.z;
          if (Math.sqrt(dx*dx + dz*dz) > room.zone.radius) {
             p.health -= 5; 
             needsStatePush = true;
             io.to(pId).emit('damaged', p.health);

             if (p.health <= 0) {
               p.health = 0;
               io.to(pId).emit('died');
               setTimeout(() => {
                 if (room.players[pId]) {
                   room.players[pId].health = 100;
                   room.players[pId].position = { x: room.zone.x + (Math.random()-0.5)*(room.zone.radius*0.8), y: 2, z: room.zone.z + (Math.random()-0.5)*(room.zone.radius*0.8) };
                   io.to(pId).emit('respawned');
                   io.to(roomId).emit('playersUpdate', { roomId, players: room.players });
                 }
               }, 3000);
             }
          }
        }
      }

      if (room.timer <= 0) {
        room.phase = 'ended';
        room.restartTimer = 15;
        const sorted = Object.values(room.players).sort((a,b)=>b.kills-a.kills);
        room.winner = sorted[0] ? sorted[0].id : null;
      }
      
      io.to(roomId).emit('roomState', { phase: room.phase, timer: room.timer, zone: room.zone, winner: room.winner, restartTimer: room.restartTimer, hostId: room.hostId });
      if (needsStatePush) io.to(roomId).emit('playersUpdate', { roomId, players: room.players });

    } else if (room.phase === 'ended') {
       room.restartTimer -= 1;
       io.to(roomId).emit('roomState', { phase: room.phase, timer: room.timer, zone: room.zone, winner: room.winner, restartTimer: room.restartTimer, hostId: room.hostId });
       
       if (room.restartTimer <= 0) {
          room.phase = 'starting';
          room.countdown = 3;
          room.timer = 120;
          room.zone.radius = 100;
          
          Object.values(room.players).forEach(p => {
             p.health = 100;
             p.kills = 0;
             p.position = { x: (Math.random() - 0.5) * 80, y: 2, z: (Math.random() - 0.5) * 80 };
             io.to(p.id).emit('respawned');
          });
          io.to(roomId).emit('playersUpdate', { roomId, players: room.players });
       }
    }
  }
}, 1000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Battle Royale Scaled Systems active natively on port ${PORT}`);
});
