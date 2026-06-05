const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay =
    document.getElementById("scoreDisplay");

const highScoreDisplay =
    document.getElementById("highScoreDisplay");

const BLOCK = 20;

const eatSound = new Audio("eat.wav");
const gameOverSound = new Audio("gameover.wav");

let snake;
let direction;
let food;
let score;
let gameOver;

let turnLocked = false;

let highScore =
    Number(localStorage.getItem("highScore")) || 0;

let gameSpeed = 120;
let lastMoveTime = 0;

let gameStarted = false;
let isPaused = false;
let gameWon = false;

let touchStartX = 0;
let touchStartY = 0;

function spawnFood() {

    let newFood;

    do {

        newFood = {
            x: Math.floor(Math.random() * (canvas.width / BLOCK)) * BLOCK,
            y: Math.floor(Math.random() * (canvas.height / BLOCK)) * BLOCK
        };

    } while (

        snake.some(segment =>
            segment.x === newFood.x &&
            segment.y === newFood.y
        )

    );

    return newFood;
}

function resetGame() {

    snake = [
        { x: 100, y: 100 }
    ];

    direction = {
        x: BLOCK,
        y: 0
    };

    score = 0;
    gameOver = false;
    gameWon = false;
    isPaused = false;

    lastMoveTime = 0;

    gameSpeed = 120;

    food = spawnFood();
}


function drawSnake() {

    snake.forEach((segment, index) => {

        if (index === 0) {

            ctx.fillStyle = "lime";

            ctx.fillRect(
                segment.x,
                segment.y,
                BLOCK,
                BLOCK
            );

            drawEyes(segment);

        } else {

            ctx.fillStyle = "green";

            ctx.fillRect(
                segment.x,
                segment.y,
                BLOCK,
                BLOCK
            );
        }
    });
}


function drawEyes(head) {

    let eye1;
    let eye2;

    if (direction.x > 0) {

        eye1 = {
            x: head.x + 14,
            y: head.y + 6
        };

        eye2 = {
            x: head.x + 14,
            y: head.y + 14
        };

    }

    else if (direction.x < 0) {

        eye1 = {
            x: head.x + 6,
            y: head.y + 6
        };

        eye2 = {
            x: head.x + 6,
            y: head.y + 14
        };

    }

    else if (direction.y < 0) {

        eye1 = {
            x: head.x + 6,
            y: head.y + 6
        };

        eye2 = {
            x: head.x + 14,
            y: head.y + 6
        };

    }

    else {

        eye1 = {
            x: head.x + 6,
            y: head.y + 14
        };

        eye2 = {
            x: head.x + 14,
            y: head.y + 14
        };
    }

    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.arc(eye1.x, eye1.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eye2.x, eye2.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "black";

    ctx.beginPath();
    ctx.arc(eye1.x, eye1.y, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eye2.x, eye2.y, 1, 0, Math.PI * 2);
    ctx.fill();
}


function drawFood() {


    ctx.fillStyle = "red";

    ctx.beginPath();

    ctx.arc(
        food.x + BLOCK / 2,
        food.y + BLOCK / 2,
        BLOCK / 2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle = "brown";

    ctx.fillRect(
        food.x + 8,
        food.y - 2,
        3,
        6
    );

    ctx.fillStyle = "lime";

    ctx.beginPath();

    ctx.arc(
        food.x + 13,
        food.y + 2,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

function endGame() {

    if (!gameOver) {

        gameOver = true;

        gameOverSound.currentTime = 0;
        gameOverSound.play();
    }
}

function moveSnake() {

    turnLocked = false;

    const head = {

        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y

    };


    if (
        head.x < 0 ||
        head.x >= canvas.width ||
        head.y < 0 ||
        head.y >= canvas.height
    ) {

        endGame();
        return;
    }


    for (let segment of snake) {

        if (
            head.x === segment.x &&
            head.y === segment.y
        ) {

            endGame();
            return;
        }
    }

    snake.unshift(head);

    if (
        head.x === food.x &&
        head.y === food.y
    ) {

        score++;

        const maxBlocks =
            (canvas.width / BLOCK) *
            (canvas.height / BLOCK);

        if (snake.length >= maxBlocks - 1) {

            gameWon = true;
            gameOver = true;
        }

        eatSound.currentTime = 0;
        eatSound.play();

        if (score > highScore) {

            highScore = score;

            localStorage.setItem(
                "highScore",
                highScore
            );
        }


        if (
            score % 5 === 0 &&
            gameSpeed > 80
        ) {

            gameSpeed -= 10;
        }

        food = spawnFood();

    } else {

        snake.pop();
    }
}


document.addEventListener("keydown", (event) => {

    if (event.code === "Space") {

        if (!gameStarted) {
            gameStarted = true;
            return;
        }

        if (gameOver) {
            resetGame();
            gameStarted = true;
            return;
        }

        isPaused = !isPaused;
        return;
    }

    if (
        gameOver &&
        (event.key === "r" || event.key === "R")
    ) {

        resetGame();
        return;
    }

    if (
        event.key === "ArrowUp" &&
        direction.y === 0 &&
        !turnLocked
    ) {

        direction = {
            x: 0,
            y: -BLOCK
        };

        turnLocked = true;
    }

    else if (
        event.key === "ArrowDown" &&
        direction.y === 0 &&
        !turnLocked
    ) {

        direction = {
            x: 0,
            y: BLOCK
        };

        turnLocked = true;
    }

    else if (
        event.key === "ArrowLeft" &&
        direction.x === 0 &&
        !turnLocked
    ) {

        direction = {
            x: -BLOCK,
            y: 0
        };

        turnLocked = true;
    }

    else if (
        event.key === "ArrowRight" &&
        direction.x === 0 &&
        !turnLocked
    ) {

        direction = {
            x: BLOCK,
            y: 0
        };

        turnLocked = true;
    }
});


function setDirectionUp() {

    if (
        direction.y === 0 &&
        !turnLocked
    ) {

        direction = {
            x: 0,
            y: -BLOCK
        };

        turnLocked = true;
    }
}

function setDirectionDown() {

    if (
        direction.y === 0 &&
        !turnLocked
    ) {

        direction = {
            x: 0,
            y: BLOCK
        };

        turnLocked = true;
    }
}

function setDirectionLeft() {
    if (
        direction.x === 0 &&
        !turnLocked
    ) {
        direction = { x: -BLOCK, y: 0 };
        turnLocked = true;
    }
}

function setDirectionRight() {
    if (
        direction.x === 0 &&
        !turnLocked
    ) {
        direction = { x: BLOCK, y: 0 };
        turnLocked = true;
    }
}

function drawGrid() {

    ctx.strokeStyle = "#2f2f2f";

    for (let x = 0; x < canvas.width; x += BLOCK) {

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += BLOCK) {

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawUI() {

    scoreDisplay.textContent =
        "Score: " + score;

    highScoreDisplay.textContent =
        "High Score: " + highScore;

    if (gameWon) {

        ctx.fillStyle = "gold";
        ctx.font = "bold 40px Arial";

        ctx.fillText(
            "YOU WIN! 🏆",
            canvas.width / 2,
            canvas.height / 2 - 20
        );
    }

    if (gameOver && !gameWon) {

        ctx.textAlign = "center";

        ctx.fillStyle = "red";
        ctx.font = "bold 40px Arial";

        ctx.fillText(
            "GAME OVER",
            canvas.width / 2,
            canvas.height / 2 - 20
        );

        ctx.fillStyle = "white";
        ctx.font = "22px Arial";

        ctx.fillText(
            "Press Space or Tap ↻ to Restart",
            canvas.width / 2,
            canvas.height / 2 + 25
        );

        ctx.fillStyle = "#cccccc";
        ctx.font = "18px Arial";

        ctx.fillText(
            "Final Score: " + score,
            canvas.width / 2,
            canvas.height / 2 + 60
        );

        ctx.textAlign = "left";
    }
}

canvas.addEventListener("touchstart", (e) => {

    if (!gameStarted) {
        gameStarted = true;
        return;
    }

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;

});

canvas.addEventListener("touchend", (e) => {

    let dx =
        e.changedTouches[0].clientX - touchStartX;

    let dy =
        e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {

        if (dx > 0) {
            setDirectionRight();
        } else {
            setDirectionLeft();
        }

    } else {

        if (dy > 0) {
            setDirectionDown();
        } else {
            setDirectionUp();
        }
    }

});

function gameLoop(timestamp) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawGrid();

    if (!gameStarted) {

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "SNAKE GAME",
            canvas.width / 2,
            canvas.height / 2 - 40
        );

        ctx.font = "25px Arial";

        ctx.fillText(
            "Tap Screen or Press SPACE to Start",
            canvas.width / 2,
            canvas.height / 2 + 20
        );

        requestAnimationFrame(gameLoop);
        return;
    }

    if (
        !gameOver &&
        !isPaused &&
        timestamp - lastMoveTime >= gameSpeed
    ) {

        moveSnake();
        lastMoveTime = timestamp;
    }

    drawFood();
    drawSnake();
    drawUI();

    if (isPaused) {

        ctx.textAlign = "center";
        ctx.fillStyle = "yellow";
        ctx.font = "40px Arial";

        ctx.fillText(
            "PAUSED",
            canvas.width / 2,
            canvas.height / 2
        );
    }

    requestAnimationFrame(gameLoop);
}

resetGame();
requestAnimationFrame(gameLoop);
