const gridSize = 5;
const gridElement = document.getElementById('grid');
const messageElement = document.getElementById('message');
const controlsElement = document.getElementById('controls');

let score = 0;
let arrows = 1;
let wumpusPos = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
let goldPos = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
let pitPos = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
let agentPos = { x: 0, y: 0 };
let hasGold = false;
let gameActive = true;

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
        case 'g': // Grab
            grab();
            break;
        case 'r': // Release
            release();
            break;
        case 's': // Shoot
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

            // Insert custom image for each cell based on its contents
            let img = document.createElement('img');
            img.style.width = '80px';
            img.style.height = '80px';

            if (i === agentPos.x && j === agentPos.y) {
                img.src = 'img/player.png'; // Player/agent image
            } else if (i === wumpusPos.x && j === wumpusPos.y) {
                img.src = 'img/wumpus.png'; // Wumpus image
            } else if (i === goldPos.x && j === goldPos.y) {
                img.src = 'img/gold.png'; // Gold image
            } else if (i === pitPos.x && j === pitPos.y) {
                img.src = 'img/pit.png'; // Pit image
            }

            if (img.src) {
                cell.appendChild(img);
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

    score -= 1; // Penalize for each step
    checkStatus();
    initializeGrid();
}

function grab() {
    if (agentPos.x === goldPos.x && agentPos.y === goldPos.y) {
        hasGold = true;
        score += 1000; // Reward for grabbing gold
        messageElement.innerHTML = 'You grabbed the gold!';
    }
}

function release() {
    if (hasGold) {
        hasGold = false;
        score -= 1000; // Penalty for releasing gold
        messageElement.innerHTML = 'You released the gold!';
    }
}

function shoot() {
    if (arrows > 0) {
        arrows--;
        if (agentPos.x === wumpusPos.x || agentPos.y === wumpusPos.y) {
            wumpusPos = { x: -1, y: -1 }; // Wumpus is killed
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
        score -= 1000; // Penalty for death
        disableGame();
    } else if (agentPos.x === pitPos.x && agentPos.y === pitPos.y) {
        messageElement.innerHTML = 'You fell into a pit! Game over.';
        score -= 1000; // Penalty for death
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
}

function initializeGame() {
    agentPos = { x: 0, y: 0 };
    wumpusPos = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
    goldPos = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
    pitPos = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
    score = 0;
    hasGold = false;
    arrows = 1;
    gameActive = true;
    controlsElement.style.display = 'block';
    messageElement.innerHTML = 'The adventure begins! Beware of the Wumpus and traps.';
    initializeGrid();
}

function alphaBetaPrune(pos, depth, alpha, beta, maximizingPlayer) {
    if (depth === 0 || !gameActive) {
        return { score: evaluateState(agentPos, wumpusPos, goldPos, pitPos, hasGold) };
    }
    const directions = ['up', 'down', 'left', 'right'];
    let bestMove = null;
    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const direction of directions) {
            const newPos = simulateMove(pos, direction);
            const eval = alphaBetaPrune(newPos, depth - 1, alpha, beta, false).score;
            if (eval > maxEval) {
                maxEval = eval;
                bestMove = direction; 
            }
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break;
        }
        return { move: bestMove, score: maxEval };
    } else {
        let minEval = Infinity;
        for (const direction of directions) {
            const newPos = simulateMove(pos, direction);
            const eval = alphaBetaPrune(newPos, depth - 1, alpha, beta, true).score;
            if (eval < minEval) {
                minEval = eval;
                bestMove = direction; 
            }
            beta = Math.min(beta, eval);
            if (beta <= alpha) break;
        }
        return { move: bestMove, score: minEval };
    }
}


function autoMove() {
    console.log("Auto Move started");
    clearInterval(autoMoveInterval);
    autoMoveInterval = setInterval(() => {
        const bestMove = alphaBetaPrune(agentPos, 3, -Infinity, Infinity, true);
        console.log("Best move determined:", bestMove.move);
        
        if (bestMove.move) {
            move(bestMove.move);
            console.log("Moved:", bestMove.move);
        }
        
        checkStatus();
    }, 1000);
}

function startAutoMove() {
    autoMoveInterval = setInterval(autoMove, 1000); 
}

initializeGame();
