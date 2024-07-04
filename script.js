const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Adjust canvas size to fit container
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Load bird and pipe images
const birdImg = new Image();
birdImg.src = 'res/img/bicho.png';

const pipeTopImg = new Image();
pipeTopImg.src = 'res/img/pip_t.png';

const pipeBottomImg = new Image();
pipeBottomImg.src = 'res/img/pip_b.png';

// Bird properties
const bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    gravity: 0.1,
    lift: -3.5,
    velocity: 0
};

let pipes = [];
const pipeWidth = 20;
const pipeGap = 100;
let frame = 0;
let score = 0;
let isGameStarted = false;
let isGamePaused = false;


const flapSound = new Audio('res/sound/woof.mp3');
const hitSound = new Audio('res/sound/hit.mp3');
const pointSound = new Audio('res/sound/point.mp3');
const bgMusic = new Audio('res/sound/shibuya.mp3');

// Preload all sounds
flapSound.load();
hitSound.load();
pointSound.load();
bgMusic.load();

// Adjust background music volume
bgMusic.volume = 0.008; // Set background music volume to 10%

// Adjust sound effects volumes
flapSound.volume = 0.1; // Set flap sound volume to 30%
hitSound.volume = 0.01; // Set hit sound volume to 50%
pointSound.volume = 0.01; // Set point sound volume to 70%

// Initialize background music muted state
let bgMusicMuted = true; // Assume background music starts muted
bgMusic.loop = true;
bgMusic.play()

// Draw the bird on the canvas
function drawBird() {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

// Draw pipes on the canvas
function drawPipes() {
    pipes.forEach(pipe => {
        ctx.drawImage(pipeTopImg, pipe.x, 0, pipeWidth, pipe.top);
        ctx.drawImage(pipeBottomImg, pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    });
}

// Update bird's position based on gravity and velocity
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Check if bird hits the ground
    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.velocity = 0;
        hitSound.play();
        showGameOverMessage();
        resetGame(); // Reset game immediately
    }
}

// Update pipes' position and manage pipe creation
function updatePipes() {
    if (frame % 120 === 0) {  // Delay first pipe appearance
        const pipeTop = Math.random() * (canvas.height - pipeGap);
        const pipeBottom = canvas.height - pipeTop - pipeGap;
        pipes.push({ x: canvas.width, top: pipeTop, bottom: pipeBottom, scored: false });
    }

    pipes.forEach(pipe => {
        pipe.x -= 2;

        // Check if bird successfully passed through the pipe
        if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
            score++;
            pointSound.play();
            pipe.scored = true;
        }

        // Check for collision with pipes
        if (
            bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
        ) {
            hitSound.play();
            showGameOverMessage();
            resetGame();
        }
    });

    // Remove pipes that have moved off screen
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

// Draw everything on the canvas (bird, pipes, score)
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBird();
    drawPipes();
}

function updateScore() {
    const playerScorePara = document.getElementById("score");
    playerScorePara.textContent = `Score: ${score}`;
}

// Update game elements (bird, pipes)
function update() {
    if (isGameStarted && !isGamePaused) {
        updateBird();
        updatePipes();
    }
}

// Main game loop
function gameLoop() {
    draw();
    updateScore();
    update();
    frame++;
    requestAnimationFrame(gameLoop);
}

// Event listener for mouse click to make the bird flap
canvas.addEventListener("click", () => {
    if (!isGameStarted) {
        resetGame();
        isGameStarted = true;
    }
    if (!isGamePaused) {
        bird.velocity = bird.lift;
        flapSound.play();
    }

    // Hide game over message when game restarts
    hideGameOverMessage();
});

// Event listener for keydown (space or arrow up) to make the bird flap
document.addEventListener("keydown", (event) => {
    if (!isGameStarted) {
        resetGame();
        isGameStarted = true;
    }
    if (!isGamePaused && (event.code === "Space" || event.code === "ArrowUp")) {
        bird.velocity = bird.lift;
        flapSound.play();
    }

    // Hide game over message when game restarts
    hideGameOverMessage();
});

// Mute button functionality
const muteButton = document.getElementById("muteButton");
muteButton.addEventListener("click", () => {
    if (bgMusic.paused) {
        bgMusic.play();
        bgMusicMuted = false; // Background music is now unmuted
        muteButton.textContent = "Mute";
    } else {
        bgMusic.pause();
        bgMusicMuted = true; // Background music is now muted
        muteButton.textContent = "Unmute";
    }
});

// Pause button functionality
const pauseButton = document.getElementById("pauseButton");
pauseButton.addEventListener("click", () => {
    isGamePaused = !isGamePaused;
    pauseButton.textContent = isGamePaused ? "Resume" : "Pause";
    if (!isGamePaused && !bgMusic.paused) {
        bgMusic.play();
    } else {
        bgMusic.pause();
    }
});

// Game over message functionality
const gameOverMessage = document.getElementById("gameOverMessage");
function showGameOverMessage() {
    gameOverMessage.style.display = "block";


}

function hideGameOverMessage() {
    gameOverMessage.style.display = "none";

}

// Reset game state
function resetGame() {
    // Reset bird position and velocity
    bird.y = 150;
    bird.velocity = 0;
    
    // Clear pipes and reset score and frame count
    pipes = [];
    score = 0;
    frame = 0;
    
    // Reset game flags
    isGameStarted = false;
    isGamePaused = false;
    
    // Hide game over message if it's visible
    //hideGameOverMessage();
    
    // Reset pause button text
    pauseButton.textContent = "Pause";
    
    // Ensure background music is playing only if not muted
    if (!bgMusicMuted) {
        bgMusic.play();
    }
}

// Start the game loop
gameLoop();