const bird = document.getElementById('bird');
const gameBox = document.getElementById('game-box');
const scoreBoard = document.getElementById('score-board');
const gameOverScreen = document.getElementById('game-over-screen');

// Core Physics and Game Variables
let birdY = 200;
let velocity = 0;
const gravity = 0.4;
const jumpImpulse = -7.5;
let score = 0;
let isGameOver = false;
let gameLoopInterval;
let pipeSpawnInterval;
let activePipes = [];

// Listen for interactions to jump or trigger resets
document.addEventListener('keydown', (e) => { if (e.code === 'Space') handleInteraction(); });
gameBox.addEventListener('click', handleInteraction);

startGame();

function startGame() {
    // Clear old elements if resetting
    activePipes.forEach(pipe => pipe.remove());
    activePipes = [];
    
    birdY = 200;
    velocity = 0;
    score = 0;
    isGameOver = false;
    scoreBoard.innerText = score;
    gameOverScreen.style.display = 'none';

    // Core Frame Logic execution tickers running every 20ms (50fps)
    gameLoopInterval = setInterval(updatePhysics, 20);
    pipeSpawnInterval = setInterval(spawnPipes, 2500); // Spawn new tubes loop
}

function handleInteraction() {
    if (isGameOver) {
        startGame();
    } else {
        velocity = jumpImpulse; // Upward velocity impulse action vector
    }
}

function updatePhysics() {
    // Apply gravity acceleration on velocity values
    velocity += gravity;
    birdY += velocity;
    bird.style.top = birdY + 'px';

    // Top roof or bottom ground area boundary box collisions check
    if (birdY <= 0 || birdY >= (gameBox.clientHeight - bird.clientHeight)) {
        triggerGameOver();
    }

    moveAndCheckPipes();
}

function spawnPipes() {
    if (isGameOver) return;

    const gapHeight = 130; // Clear height window gap size to fly through
    const minHeight = 50;
    const maxHeight = gameBox.clientHeight - gapHeight - minHeight;
    const topPipeHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    const bottomPipeHeight = gameBox.clientHeight - gapHeight - topPipeHeight;

    // Build upper obstacle element node
    const topPipe = document.createElement('div');
    topPipe.classList.add('pipe');
    topPipe.style.height = topPipeHeight + 'px';
    topPipe.style.top = '0px';
    topPipe.style.left = '400px';
    topPipe.passed = false;

    // Build bottom obstacle element node
    const bottomPipe = document.createElement('div');
    bottomPipe.classList.add('pipe');
    bottomPipe.style.height = bottomPipeHeight + 'px';
    bottomPipe.style.bottom = '0px';
    bottomPipe.style.left = '400px';

    gameBox.appendChild(topPipe);
    gameBox.appendChild(bottomPipe);
    activePipes.push(topPipe, bottomPipe);
}

function moveAndCheckPipes() {
    for (let i = activePipes.length - 1; i >= 0; i--) {
        const pipe = activePipes[i];
        let pipeLeft = parseInt(pipe.style.left);
        pipeLeft -= 2; // Scroll movement speed factor translation
        pipe.style.left = pipeLeft + 'px';

        // Delete pipes that go off screen to optimize memory usage
        if (pipeLeft < -60) {
            pipe.remove();
            activePipes.splice(i, 1);
            continue;
        }

        // Handle collision checks
        if (checkCollision(bird, pipe)) {
            triggerGameOver();
            return;
        }

        // Increase score when passing upper obstacle boundaries safely
        if (pipe.style.top === '0px' && !pipe.passed && pipeLeft < 50) {
            pipe.passed = true;
            score++;
            scoreBoard.innerText = score;
        }
    }
}

function checkCollision(element1, element2) {
    const r1 = element1.getBoundingClientRect();
    const r2 = element2.getBoundingClientRect();

    return !(r1.right < r2.left || 
             r1.left > r2.right || 
             r1.bottom < r2.top || 
             r1.top > r2.bottom);
}

function triggerGameOver() {
    isGameOver = true;
    clearInterval(gameLoopInterval);
    clearInterval(pipeSpawnInterval);
    gameOverScreen.style.display = 'block';
}
