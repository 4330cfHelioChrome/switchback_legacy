const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let rooms = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Request room list
    socket.on('get_rooms', () => {
        socket.emit('room_list', rooms);
    });

    // Create room
    socket.on('create_room', (data) => {
        const roomId = 'room_' + Math.random().toString(36).substring(2, 6);
        const inviteCode = Math.random().toString(36).substring(2, 6).toUpperCase();

        rooms[roomId] = {
            id: roomId,
            name: data.name,
            maxPlayers: data.maxPlayers,
            totalCards: data.totalCards,
            isPublic: data.isPublic,
            isStarted: false,
            hostId: socket.id,
            players: [{ id: socket.id, name: 'Host', isHost: true }],
            inviteCode: inviteCode
        };

        socket.join(roomId);
        socket.emit('room_created', rooms[roomId]);
        io.emit('room_list_update', rooms);
    });

    // Join room
    socket.on('join_room', (roomId) => {
        const room = rooms[roomId];
        if (!room) {
            return socket.emit('error_message', 'Room not found.');
        }
        if (room.isStarted) {
            // Join as spectator
            socket.join(roomId);
            socket.emit('joined_as_spectator', room);
            return;
        }
        if (room.players.length >= room.maxPlayers) {
            return socket.emit('error_message', 'Room is full.');
        }

        room.players.push({ id: socket.id, name: `Player ${room.players.length + 1}`, isHost: false });
        socket.join(roomId);
        io.to(roomId).emit('update_room_players', room);
        io.emit('room_list_update', rooms);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Handle player removal from rooms if needed
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
