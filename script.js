const socket = io();

let currentRoomId = null;
let isHost = false;

// View switching function with fade effect
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

// Request room list on load
socket.on('connect', () => {
    socket.emit('get_rooms');
});

socket.on('room_list', (rooms) => {
    renderRoomList(rooms);
});

socket.on('room_list_update', (rooms) => {
    renderRoomList(rooms);
});

// Room creation logic
function createRoom() {
    const name = document.getElementById('room-name-input').value;
    const maxPlayers = parseInt(document.getElementById('max-players-input').value);
    const totalCards = parseInt(document.getElementById('total-cards-input').value);
    const isPublic = document.getElementById('is-public-input').checked;

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
    document.getElementById('room-title-display').innerText = room.name;
    document.getElementById('invite-code-display').innerText = room.inviteCode;
    showView('room-view');
});

function renderRoomList(rooms) {
    const waitingListEl = document.getElementById('waiting-room-list');
    const activeListEl = document.getElementById('active-room-list');

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

socket.on('update_room_players', (room) => {
    currentRoomId = room.id;
    document.getElementById('room-title-display').innerText = room.name;
    document.getElementById('invite-code-display').innerText = room.inviteCode;
    
    const playerListEl = document.getElementById('player-list');
    playerListEl.innerHTML = '';
    room.players.forEach(p => {
        const li = document.createElement('li');
        li.className = 'room-item';
        li.innerHTML = `<span>${p.name}</span> <span>${p.isHost ? '[Host]' : ''}</span>`;
        playerListEl.appendChild(li);
    });

    showView('room-view');
});

socket.on('joined_as_spectator', (room) => {
    currentRoomId = room.id;
    showView('game-view');
    document.getElementById('role-badge').innerText = '(Spectator Mode - Hand Hidden)';
    initGameAsSpectator();
});

socket.on('error_message', (msg) => {
    alert(msg);
});

function startGame() {
    showView('game-view');
    document.getElementById('role-badge').innerText = '(Player)';
    initGame();
}

function initGame() {
    const handEl = document.getElementById('player-hand');
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
    handEl.innerHTML = '<p style="color: var(--text-muted);">Spectators cannot view player hands.</p>';
}

function actionDraw() {
    alert('You drew 1 card. Turn ended!');
}

function actionChange() {
    alert('Change! Direction reversed and turn passed.');
}
