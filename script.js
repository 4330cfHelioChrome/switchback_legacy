// View switching function
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

// Room creation logic and validation (players 2~6, cards 80~200)
function createRoom() {
    const name = document.getElementById('room-name-input').value;
    const maxPlayers = parseInt(document.getElementById('max-players-input').value);
    const totalCards = parseInt(document.getElementById('total-cards-input').value);

    if (maxPlayers < 2 || maxPlayers > 6) {
        alert('The number of players must be between 2 and 6.');
        return;
    }
    if (totalCards < 80 || totalCards > 200) {
        alert('The total number of cards must be between 80 and 200.');
        return;
    }

    document.getElementById('room-title-display').innerText = name;
    document.getElementById('invite-code-display').innerText = Math.random().toString(36).substring(2, 6).toUpperCase();
    showView('room-view');
}

function joinRoom(roomName) {
    document.getElementById('room-title-display').innerText = roomName;
    showView('room-view');
}

// Initialize game when started
function startGame() {
    showView('game-view');
    initGame();
}

function initGame() {
    const handEl = document.getElementById('player-hand');
    handEl.innerHTML = '';
    // Sample random hand for testing
    const sampleCards = [14, 28, 45, 61, 88, 92];
    sampleCards.forEach(num => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = num;
        card.onclick = () => alert(`You played card ${num}!`);
        handEl.appendChild(card);
    });
}

function actionDraw() {
    alert('You drew 1 card. Turn ended!');
}

function actionChange() {
    alert('Change! Direction reversed and turn passed.');
}
