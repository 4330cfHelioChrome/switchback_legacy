const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORS 설정 (Vercel 프론트엔드 및 모든 출처 허용)
const io = new Server(server, {
  cors: {
    origin: "*", // 필요시 안전하게 "https://switchbackcardgame.vercel.app" 등으로 제한 가능
    methods: ["GET", "POST"]
  }
});

// Render 서버가 살아있는지 확인할 수 있는 기본 루트 경로
app.get('/', (req, res) => {
  res.send('Switchback Game Server is running successfully!');
});

// 방(Rooms) 데이터를 관리하는 메모리 저장소
const rooms = {};

// 난수 생성기 (초대 코드용)
function generateInviteCode() {
  return Math.random().toString(36.substring(2, 8)).toUpperCase();
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. 방 목록 요청
  socket.on('get_rooms', () => {
    socket.emit('room_list', rooms);
  });

  // 2. 방 생성
  socket.on('create_room', (data) => {
    const roomId = 'room_' + Math.random().toString(36).substring(2, 9);
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    rooms[roomId] = {
      id: roomId,
      name: data.name || 'Switchback Room',
      maxPlayers: data.maxPlayers || 4,
      totalCards: data.totalCards || 100,
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      isStarted: false,
      players: [
        { id: socket.id, name: `Player_${socket.id.substring(0, 4)}`, isHost: true }
      ],
      spectators: []
    };

    socket.join(roomId);
    socket.emit('room_created', rooms[roomId]);
    
    // 전체 사용자에게 방 목록 업데이트 브로드캐스트
    io.emit('room_list_update', rooms);
  });

  // 3. 방 참가
  socket.on('join_room', (roomId) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit('error_message', 'Room not found.');
      return;
    }
    if (room.isStarted) {
      socket.emit('error_message', 'Game has already started.');
      return;
    }
    if (room.players.length >= room.maxPlayers) {
      socket.emit('error_message', 'Room is full.');
      return;
    }

    // 이미 참가한 유저가 아니라면 추가
    if (!room.players.some(p => p.id === socket.id)) {
      room.players.push({
        id: socket.id,
        name: `Player_${socket.id.substring(0, 4)}`,
        isHost: false
      });
    }

    socket.join(roomId);
    io.to(roomId).emit('update_room_players', room);
    io.emit('room_list_update', rooms);
  });

  // 4. 관전하기
  socket.on('spectate_room', (roomId) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit('error_message', 'Room not found.');
      return;
    }
    socket.join(roomId);
    socket.emit('joined_as_spectator', room);
  });

  // 5. 게임 시작
  socket.on('start_game', (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    // 호스트 권한 확인
    const player = room.players.find(p => p.id === socket.id);
    if (player && player.isHost) {
      room.isStarted = true;
      io.to(roomId).emit('game_started');
      io.emit('room_list_update', rooms);
    }
  });

  // 6. 연결 해제 처리
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // 유저가 속한 방에서 제거
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter(p => p.id !== socket.id);

      if (room.players.length === 0) {
        // 방에 사람이 없으면 방 삭제
        delete rooms[roomId];
      } else {
        // 방장이 나갔다면 다른 사람에게 방장 위임
        if (!room.players.some(p => p.isHost)) {
          room.players[0].isHost = true;
        }
        io.to(roomId).emit('update_room_players', room);
      }
    }
    io.emit('room_list_update', rooms);
  });
});

// Render가 자동 할당하는 포트 사용 (로컬에서는 3000번)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Switchback server running on port ${PORT}`);
});
