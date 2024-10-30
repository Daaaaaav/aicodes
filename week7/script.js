const gridSize = 5;
const gridElement = document.getElementById('grid');
const messageElement = document.getElementById('message');
const controlsElement = document.getElementById('controls');

let score = 0;
let arrows = 1;
let wumpusPos, goldPos, pitPos;
let agentPos = { x: 0, y: 0 };
let hasGold = false;
let gameActive = true;
let autoMoveInterval = null;
let returningHome = false;

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
    switch (event.key) {
        case 'ArrowUp':
            move('up');
            break;
        case 'ArrowDown':
            move('down');
            break;
        case 'ArrowLeft':
            move('left');
            break;
        case 'ArrowRight':
            move('right');
            break;
        case 'g':
            grab();
            break;
        case 'r':
            release();
            break;
        case 's':
            shoot();
            break;
    }
}

function initializeGrid() {
    gridElement.innerHTML = '';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            let images = document.createElement('img');
            images.style.width = '80px';
            images.style.height = '80px';

            if (i === agentPos.x && j === agentPos.y) {
                images.src = 'images/player.png';
            } else if (i === wumpusPos.x && j === wumpusPos.y) {
                images.src = 'images/wumpus.png';
            } else if (i === goldPos.x && j === goldPos.y) {
                images.src = 'images/gold.png';
            } else if (i === pitPos.x && j === pitPos.y) {
                images.src = 'images/pit.png';
            }

            if (images.src) {
                cell.appendChild(images);
            }
            gridElement.appendChild(cell);
        }
    }
}

function move(direction) {
    if (!gameActive) return;

    switch (direction) {
        case 'up':
            if (agentPos.x > 0) agentPos.x--;
            break;
        case 'down':
            if (agentPos.x < gridSize - 1) agentPos.x++;
            break;
        case 'left':
            if (agentPos.y > 0) agentPos.y--;
            break;
        case 'right':
            if (agentPos.y < gridSize - 1) agentPos.y++;
            break;
    }

    score -= 1;
    checkStatus();
    initializeGrid();
}

function grab() {
    if (agentPos.x === goldPos.x && agentPos.y === goldPos.y) {
        hasGold = true;
        score += 1000;
        messageElement.innerHTML = 'You grabbed the gold!';
        returningHome = true;
    }
}

function release() {
    if (hasGold) {
        hasGold = false;
        score -= 1000;
        messageElement.innerHTML = 'You released the gold!';
    }
}

function shoot() {
    if (arrows > 0) {
        arrows--;
        if (agentPos.x === wumpusPos.x || agentPos.y === wumpusPos.y) {
            wumpusPos = { x: -1, y: -1 };
            messageElement.innerHTML = 'You killed the Wumpus!';
        } else {
            messageElement.innerHTML = 'You missed the Wumpus!';
        }
    } else {
        messageElement.innerHTML = 'You have no arrows left!';
    }
}

function checkStatus() {
    if (agentPos.x === wumpusPos.x && agentPos.y === wumpusPos.y) {
        messageElement.innerHTML = 'You encountered the Wumpus! Game over.';
        score -= 1000;
        disableGame();
    } else if (agentPos.x === pitPos.x && agentPos.y === pitPos.y) {
        messageElement.innerHTML = 'You fell into a pit! Game over.';
        score -= 1000;
        disableGame();
    } else if (hasGold && agentPos.x === 0 && agentPos.y === 0) {
        messageElement.innerHTML = 'Congratulations! You returned home with the gold!';
        disableGame();
    } else {
        giveHints();
    }
}

function giveHints() {
    const nearWumpus = Math.abs(agentPos.x - wumpusPos.x) <= 1 && Math.abs(agentPos.y - wumpusPos.y) <= 1;
    const nearPit = Math.abs(agentPos.x - pitPos.x) <= 1 && Math.abs(agentPos.y - pitPos.y) <= 1;

    if (nearWumpus && nearPit) {
        messageElement.innerHTML = 'There is a foul smell and strange wind nearby...';
    } else if (nearWumpus) {
        messageElement.innerHTML = 'You smell something foul... It\'s the Wumpus!';
    } else if (nearPit) {
        messageElement.innerHTML = 'There is a strange wind... A pit might be nearby.';
    } else if (agentPos.x === goldPos.x && agentPos.y === goldPos.y) {
        messageElement.innerHTML = 'You see a glittering gold!';
    } else {
        messageElement.innerHTML = 'It\'s safe to move!';
    }
}

function disableGame() {
    gameActive = false;
    controlsElement.style.display = 'none';
    clearInterval(autoMoveInterval);
}

function initializeGame() {
    agentPos = { x: 0, y: 0 };
    function generateRandomPosition() {
        let pos;
        do {
            pos = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
        } while (pos.x === 0 && pos.y === 0); 
        return pos;
    }

    wumpusPos = generateRandomPosition();
    goldPos = generateRandomPosition();
    pitPos = generateRandomPosition();

    score = 0;
    hasGold = false;
    arrows = 1;
    gameActive = true;
    returningHome = false;
    controlsElement.style.display = 'block';
    messageElement.innerHTML = 'The adventure begins! Beware of the Wumpus and traps.';
    initializeGrid();
    clearInterval(autoMoveInterval);
}

function startAutoMove() {
    if (autoMoveInterval) clearInterval(autoMoveInterval);
    autoMoveInterval = setInterval(autoMove, 1000);
}

function autoMove() {
    if (returningHome) {
        if (agentPos.x > 0) {
            move('up');
        } else if (agentPos.y > 0) {
            move('left');
        }
    } else {
        const directions = ['up', 'down', 'left', 'right'];
        const bestMove = directions.reduce((best, dir) => {
            const newPos = simulateMove(agentPos, dir);
            const score = evaluateState(newPos, wumpusPos, goldPos, pitPos, hasGold);
            return score > best.score ? { move: dir, score } : best;
        }, { move: null, score: -Infinity });
        if (bestMove.move) {
            move(bestMove.move);
        }
    }
}

function simulateMove(pos, direction) {
    const newPos = { ...pos };
    switch (direction) {
        case 'up':
            if (newPos.x > 0) newPos.x--;
            break;
        case 'down':
            if (newPos.x < gridSize - 1) newPos.x++;
            break;
        case 'left':
            if (newPos.y > 0) newPos.y--;
            break;
        case 'right':
            if (newPos.y < gridSize - 1) newPos.y++;
            break;
    }
    return newPos;
}

function evaluateState(agentPos, wumpusPos, goldPos, pitPos, hasGold) {
    if (returningHome) {
        const distanceToHome = Math.abs(agentPos.x - 0) + Math.abs(agentPos.y - 0);
        return 1000 - distanceToHome;
    }

    if (agentPos.x === goldPos.x && agentPos.y === goldPos.y) {
        return 1000;
    }

    if (agentPos.x === wumpusPos.x && agentPos.y === wumpusPos.y) {
        return -1000;
    }
    if (agentPos.x === pitPos.x && agentPos.y === pitPos.y) {
        return -1000;
    }

    const distanceToGold = Math.abs(agentPos.x - goldPos.x) + Math.abs(agentPos.y - goldPos.y);
    return 100 - distanceToGold;
}

initializeGame();
