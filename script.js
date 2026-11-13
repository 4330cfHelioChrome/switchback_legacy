// Global state for rooms and current session
let rooms = [];
let currentRoomId = null;
let isHost = false;

// View switching function
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    if (viewId === 'lobby-view') {
        renderRoomList();
    }
}

// Room creation logic with public toggle and validation
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

    const roomId = 'room_' + Math.random().toString(36).substring(2, 6);
    const inviteCode = Math.random().toString(36).substring(2, 6).toUpperCase();

    const newRoom = {
        id: roomId,
        name: name,
        maxPlayers: maxPlayers,
        totalCards: totalCards,
        isPublic: isPublic,
        isStarted: false,
        playersCount: 1,
        inviteCode: inviteCode
    };

    rooms.push(newRoom);
    currentRoomId = roomId;
    isHost = true;

    document.getElementById('room-title-display').innerText = name;
    document.getElementById('invite-code-display').innerText = inviteCode;
    showView('room-view');
}

// Render public waiting rooms and active games in lobby
function renderRoomList() {
    const waitingListEl = document.getElementById('waiting-room-list');
    const activeListEl = document.getElementById('active-room-list');

    waitingListEl.innerHTML = '';
    activeListEl.innerHTML = '';

    const publicWaiting = rooms.filter(r => r.isPublic && !r.isStarted);
    const activeGames = rooms.filter(r => r.isStarted);

    if (publicWaiting.length === 0) {
        waitingListEl.innerHTML = '<li class="room-item" style="color: var(--text-muted); justify-content: center;">No public waiting rooms available.</li>';
    } else {
        publicWaiting.forEach(room => {
            const li = document.createElement('li');
            li.className = 'room-item';
            li.innerHTML = `<span>${room.name} (Players: ${room.playersCount}/${room.maxPlayers}, Cards: ${room.totalCards})</span>
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
            li.innerHTML = `<span>[Playing] ${room.name} (Players: ${room.playersCount}/${room.maxPlayers})</span>
                            <button onclick="spectateRoom('${room.id}')" style="background: #475569;">Spectate</button>`;
            activeListEl.appendChild(li);
        });
    }
}

function joinRoom(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    currentRoomId = roomId;
    isHost = false;
    document.getElementById('room-title-display').innerText = room.name;
    document.getElementById('invite-code-display').innerText = room.inviteCode;
    showView('room-view');
}

function spectateRoom(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    currentRoomId = roomId;
    showView('game-view');
    document.getElementById('role-badge').innerText = '(Spectator Mode - Hand Hidden)';
    initGameAsSpectator();
}

// Initialize game when started by host
function startGame() {
    const room = rooms.find(r => r.id === currentRoomId);
    if (room) {
        room.isStarted = true;
    }
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

// Initial render call when script loads
renderRoomList();
