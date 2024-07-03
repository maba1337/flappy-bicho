const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 320;
canvas.height = 480;

// Load bird and pipe images
const birdImg = new Image();
birdImg.src = 'res/img/bicho.png';

const pipeTopImg = new Image();
pipeTopImg.src = 'res/img/green.png';

const pipeBottomImg = new Image();
pipeBottomImg.src = 'res/img/green.png';

// Bird properties
const bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    gravity: 0.6,
    lift: -15,
    velocity: 0
};

let pipes = [];
const pipeWidth = 20;
const pipeGap = 100;
let frame = 0;
let score = 0;

// Load sound effects and background music
const flapSound = document.getElementById("flapSound");
const hitSound = document.getElementById("hitSound");
const pointSound = document.getElementById("pointSound");
const bgMusic = document.getElementById("bgMusic");
bgMusic.play();

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
        resetGame();
    }
}

// Update pipes' position and manage pipe creation
function updatePipes() {
    if (frame % 90 === 0) {
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
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText("Score: " + score, 10, 20);
}

// Update game elements (bird, pipes)
function update() {
    updateBird();
    updatePipes();
}

// Main game loop
function gameLoop() {
    draw();
    update();
    frame++;
    requestAnimationFrame(gameLoop);
}

// Event listener for mouse click to make the bird flap
canvas.addEventListener("click", () => {
    bird.velocity = bird.lift;
    flapSound.play();
});

// Event listener for keydown (space or arrow up) to make the bird flap
document.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp") {
        bird.velocity = bird.lift;
        flapSound.play();
    }
});

// Reset game state
function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frame = 0;
}

// Start the game loop
gameLoop();
