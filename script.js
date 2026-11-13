// 백엔드 서버 URL 설정 (로컬 vs Render 배포 환경 자동 감지)
const backendURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://srv-dbremm49v7es73ccamp0.onrender.com';

const socket = io(backendURL);

let currentRoomId = null;
let isHost = false;

// 뷰 전환 함수 (Fade 효과)
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

// 연결 성공 시 방 목록 요청
socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    socket.emit('get_rooms');
});

socket.on('room_list', (rooms) => {
    renderRoomList(rooms);
});

socket.on('room_list_update', (rooms) => {
    renderRoomList(rooms);
});

// 방 생성 요청 함수
function createRoom() {
    const nameInput = document.getElementById('room-name-input');
    const maxPlayersInput = document.getElementById('max-players-input');
    const totalCardsInput = document.getElementById('total-cards-input');
    const isPublicInput = document.getElementById('is-public-input');

    const name = nameInput ? nameInput.value : 'Switchback Room';
    const maxPlayers = maxPlayersInput ? parseInt(maxPlayersInput.value) : 4;
    const totalCards = totalCardsInput ? parseInt(totalCardsInput.value) : 100;
    const isPublic = isPublicInput ? isPublicInput.checked : true;

    if (maxPlayers < 2 || maxPlayers > 6) {
        alert('The number of players must be between 2 and 6.');
        return;
    }
    if (totalCards < 80 || totalCards > 200) {
        alert('The total number of cards must be between 80 and 200.');
        return;
    }

    socket.emit('create_room', { name, maxPlayers, totalCards, isPublic });
}

socket.on('room_created', (room) => {
    currentRoomId = room.id;
    isHost = true;
    
    const titleDisplay = document.getElementById('room-title-display');
    const inviteDisplay = document.getElementById('invite-code-display');
    if (titleDisplay) titleDisplay.innerText = room.name;
    if (inviteDisplay) inviteDisplay.innerText = room.inviteCode;
    
    showView('room-view');
});

// 방 목록 렌더링
function renderRoomList(rooms) {
    const waitingListEl = document.getElementById('waiting-room-list');
    const activeListEl = document.getElementById('active-room-list');

    if (!waitingListEl || !activeListEl) return;

    waitingListEl.innerHTML = '';
    activeListEl.innerHTML = '';

    const roomArray = Object.values(rooms);
    const publicWaiting = roomArray.filter(r => r.isPublic && !r.isStarted);
    const activeGames = roomArray.filter(r => r.isStarted);

    if (publicWaiting.length === 0) {
        waitingListEl.innerHTML = '<li class="room-item" style="color: var(--text-muted); justify-content: center;">No public waiting rooms available.</li>';
    } else {
        publicWaiting.forEach(room => {
            const li = document.createElement('li');
            li.className = 'room-item';
            li.innerHTML = `<span>${room.name} (Players: ${room.players.length}/${room.maxPlayers}, Cards: ${room.totalCards})</span>
                            <button onclick="joinRoom('${room.id}')">Join</button>`;
            waitingListEl.appendChild(li);
        });
    }

    if (activeGames.length === 0) {
        activeListEl.innerHTML = '<li class="room-item" style="color: var(--text-muted); justify-content: center;">No active games in progress.</li>';
    } else {
        activeGames.forEach(room => {
            const li = document.createElement('li');
            li.className = 'room-item';
            li.innerHTML = `<span>[Playing] ${room.name} (Players: ${room.players.length}/${room.maxPlayers})</span>
                            <button onclick="spectateRoom('${room.id}')" style="background: #475569;">Spectate</button>`;
            activeListEl.appendChild(li);
        });
    }
}

function joinRoom(roomId) {
    socket.emit('join_room', roomId);
}

function spectateRoom(roomId) {
    socket.emit('spectate_room', roomId);
}

socket.on('update_room_players', (room) => {
    currentRoomId = room.id;
    
    const titleDisplay = document.getElementById('room-title-display');
    const inviteDisplay = document.getElementById('invite-code-display');
    if (titleDisplay) titleDisplay.innerText = room.name;
    if (inviteDisplay) inviteDisplay.innerText = room.inviteCode;
    
    const playerListEl = document.getElementById('player-list');
    if (playerListEl) {
        playerListEl.innerHTML = '';
        room.players.forEach(p => {
            const li = document.createElement('li');
            li.className = 'room-item';
            li.innerHTML = `<span>${p.name}</span> <span>${p.isHost ? '[Host]' : ''}</span>`;
            playerListEl.appendChild(li);
        });
    }

    showView('room-view');
});

socket.on('joined_as_spectator', (room) => {
    currentRoomId = room.id;
    showView('game-view');
    const roleBadge = document.getElementById('role-badge');
    if (roleBadge) roleBadge.innerText = '(Spectator Mode - Hand Hidden)';
    initGameAsSpectator();
});

// 서버에서 게임 시작 신호가 올 때 실행
socket.on('game_started', () => {
    startGame();
});

socket.on('error_message', (msg) => {
    alert(msg);
});

// 게임 시작 함수 (호스트가 시작 버튼을 누를 때 호출)
function startGame() {
    if (isHost) {
        socket.emit('start_game', currentRoomId);
    }
    showView('game-view');
    const roleBadge = document.getElementById('role-badge');
    if (roleBadge) roleBadge.innerText = '(Player)';
    initGame();
}

function initGame() {
    const handEl = document.getElementById('player-hand');
    if (!handEl) return;
    handEl.innerHTML = '';
    const sampleCards = [14, 28, 45, 61, 88, 92];
    sampleCards.forEach(num => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = num;
        card.onclick = () => alert(`You played card ${num}!`);
        handEl.appendChild(card);
    });
}

function initGameAsSpectator() {
    const handEl = document.getElementById('player-hand');
    if (handEl) {
        handEl.innerHTML = '<p style="color: var(--text-muted);">Spectators cannot view player hands.</p>';
    }
}

function actionDraw() {
    alert('You drew 1 card. Turn ended!');
}

function actionChange() {
    alert('Change! Direction reversed and turn passed.');
}
