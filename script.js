const canvas = document.querySelector(".canvas");
const ctx = canvas.getContext("2d");
const welcomeScreen = document.querySelector(".welcome");
const lives = document.querySelector(".lives");
const level = document.querySelector(".level");
const score = document.querySelector(".score");
const highScore = document.querySelector(".highScore");
const message = document.querySelector(".message");

const width = canvas.getBoundingClientRect().width;
const height = canvas.getBoundingClientRect().height;

canvas.width = width;
canvas.height = height;

let currentVelocity = 5;
let scoreMultiplier = 100;

let livesCounter = 3;
let levelCounter = 1;
let scoreCounter = 0;
let highScoreCounter = 0;

let onWelcomeScreen = true;
let gameStarted = false;
let spaceWasPressed = false;

const paddle = {
  width: 150,
  height: 20,
  posX: width / 2 - 150 / 2,
  posY: height - 20 * 2,
  leftPressed: false,
  rightPressed: false,
  speed: 5,
};

const ball = {
  size: 10,
  // posX: 95,
  // posY: 220,
  posX: width / 2,
  // posY: height / 2,
  posY: paddle.posY - 11,
  velX: 0,
  velY: 0,
  // velX: currentVelocity,
  // velY: currentVelocity,
};

let brickRows = 1;
let brickColumns = 2;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 80;
let brickOffsetLeft = 80;
let totalBricksGenerated = 0;
let brickWidth =
  (width -
    brickOffsetLeft -
    (brickOffsetLeft / brickColumns) * brickColumns -
    brickPadding * (brickColumns - 1)) /
  brickColumns;

let bricks = [];

function playSound(file) {
  return;
  let audio = new Audio(file);
  audio.play();
}

function checkForWin() {
  if (scoreCounter === totalBricksGenerated) {
    levelCounter += 1;
    showMessage(`LEVEL ${levelCounter}`, 2000);
    gameStarted = false;
    currentVelocity += 1.25;
    if (brickRows < 5) {
      brickRows += 1;
    }
    if (brickColumns < 10) {
      brickColumns += 1;
    }
    paddle.speed += 1.25;
    resetBall();
    generateBricks();
  }
}

function showMessage(text, time) {
  message.innerHTML = text;
  // message.style.display = "block";
  message.style.opacity = "1";
  setTimeout(() => {
    // message.style.display = "block";
    message.style.opacity = "0";
  }, time);
}

function checkForLose() {
  if (ball.posY > height + ball.size) {
    resetBall();
    livesCounter -= 1;
    gameStarted = false;
    onWelcomeScreen = false;
    if (livesCounter === 0) {
      showMessage("GAME OVER!", 1000);
      setTimeout(() => {
        currentVelocity = 5;
        livesCounter = 3;
        levelCounter = 1;
        scoreCounter = 0;
        totalBricksGenerated = 0;
        bricks = [];
        brickRows = 1;
        brickColumns = 2;
        paddle.speed = 5;
        generateBricks();
        welcomeScreen.style.display = "block";
        canvas.style.display = "none";
        onWelcomeScreen = true;
      }, 2000);
    } else {
      showMessage("MISS!", 500);
    }
  }
}

function resetBall() {
  ball.posX = paddle.posX + paddle.width / 2;
  ball.posY = paddle.posY - ball.size - 1;
  ball.velX = 0;
  ball.velY = 0;
}

function drawScore() {
  ctx.font = "26px Arial";
  ctx.fillStyle = "#ccc";
  ctx.fillText("SCORE: " + score, 8, 40);
}
function drawLives() {
  ctx.font = "26px Arial";
  ctx.fillStyle = "#ccc";
  ctx.fillText("LIVES: " + lives, 8, width / 2);
}

function brickCollisionDetection() {
  for (let i = 0; i < brickColumns; i++) {
    for (let j = 0; j < brickRows; j++) {
      const brick = bricks[i][j];
      // check if ball top hits brick
      if (
        ball.posX >= brick.posX &&
        ball.posX <= brick.posX + brickWidth &&
        ball.posY - ball.size >= brick.posY &&
        ball.posY - ball.size <= brick.posY + brickHeight
      ) {
        playSound("audio/hitBrick.mp3");
        ball.velY = Math.abs(ball.velY);
        brick.status = 0;
        brick.posX = -1000;
        brick.posY = -1000;
        scoreCounter += 1;
      }

      // check if ball bottom hits brick
      if (
        ball.posX >= brick.posX &&
        ball.posX <= brick.posX + brickWidth &&
        ball.posY + ball.size >= brick.posY &&
        ball.posY + ball.size <= brick.posY + brickHeight
      ) {
        playSound("audio/hitBrick.mp3");
        ball.velY = -Math.abs(ball.velY);
        brick.status = 0;
        brick.posX = -1000;
        brick.posY = -1000;
        scoreCounter += 1;
      }

      // check if ball left hits brick
      if (
        ball.posX - ball.size >= brick.posX &&
        ball.posX - ball.size <= brick.posX + brickWidth &&
        ball.posY >= brick.posY &&
        ball.posY <= brick.posY + brickHeight
      ) {
        playSound("audio/hitBrick.mp3");
        ball.velX = -ball.velX;
        brick.status = 0;
        brick.posX = -1000;
        brick.posY = -1000;
        scoreCounter += 1;
      }

      // check if ball right hits brick
      if (
        ball.posX + ball.size >= brick.posX &&
        ball.posX + ball.size <= brick.posX + brickWidth &&
        ball.posY >= brick.posY &&
        ball.posY <= brick.posY + brickHeight
      ) {
        playSound("audio/hitBrick.mp3");
        ball.velX = -ball.velX;
        brick.status = 0;
        brick.posX = -1000;
        brick.posY = -1000;
        scoreCounter += 1;
      }
    }
  }
}

function generateBricks() {
  brickWidth =
    (width -
      brickOffsetLeft -
      (brickOffsetLeft / brickColumns) * brickColumns -
      brickPadding * (brickColumns - 1)) /
    brickColumns;
  for (let i = 0; i < brickColumns; i++) {
    bricks[i] = [];
    for (let j = 0; j < brickRows; j++) {
      bricks[i][j] = { posX: 0, posY: 0, status: 1 };
      totalBricksGenerated += 1;
    }
  }
}
generateBricks();

function drawBricks() {
  for (let i = 0; i < brickColumns; i++) {
    for (let j = 0; j < brickRows; j++) {
      if (bricks[i][j].status == 1) {
        const posX = i * (brickWidth + brickPadding) + brickOffsetLeft;
        const posY = j * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[i][j].posX = posX;
        bricks[i][j].posY = posY;
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(posX, posY, posX, posY + brickHeight);
        gradient.addColorStop(0, "#8E00E5");
        gradient.addColorStop(1, "#4D00F0");
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;
        ctx.shadowColor = "black";
        ctx.fillStyle = gradient;
        ctx.rect(posX, posY, brickWidth, brickHeight);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = "none";
        ctx.closePath();
      }
    }
  }
}

function drawBall() {
  // const gradient = ctx.createRadialGradient(
  //   ball.posX,
  //   ball.posY,
  //   0,
  //   ball.posX,
  //   ball.posY,
  //   ball.size
  // );

  // gradient.addColorStop(0, "#000");
  // gradient.addColorStop(1, "#666");
  // ctx.shadowBlur = 5;
  // ctx.shadowOffsetX = 0;
  // ctx.shadowOffsetY = 0;
  ctx.shadowColor = "#333";
  ctx.beginPath();
  ctx.fillStyle = "#ccc";
  ctx.arc(ball.posX, ball.posY, ball.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  const gradient = ctx.createLinearGradient(
    paddle.posX,
    paddle.posY,
    paddle.posX,
    paddle.posY + paddle.height
  );
  gradient.addColorStop(0, "#FF60D2");
  gradient.addColorStop(1, "#7F0094");
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 3;
  ctx.shadowColor = "black";
  ctx.beginPath();
  ctx.fillStyle = gradient;

  ctx.fillRect(paddle.posX, paddle.posY, paddle.width, paddle.height);
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = "none";
}

function drawBounds() {
  const pointSize = 4;
  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.fillRect(
    ball.posX + ball.size - pointSize / 2,
    ball.posY - pointSize / 2,
    pointSize,
    pointSize
  );
  ctx.fillRect(
    ball.posX - ball.size - pointSize / 2,
    ball.posY - pointSize / 2,
    pointSize,
    pointSize
  );
  ctx.fillRect(
    ball.posX - pointSize / 2,
    ball.posY - ball.size - pointSize / 2,
    pointSize,
    pointSize
  );
  ctx.fillRect(
    ball.posX - pointSize / 2,
    ball.posY + ball.size - pointSize / 2,
    pointSize,
    pointSize
  );
  ctx.closePath();
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  // drawScore();
  // drawLives();
  drawBricks();
  drawBall();
  brickCollisionDetection();
  drawPaddle();
  handleGameBounds();
  handlePaddleControls();
  handleBallPaddleCollision();
  updateDisplay();
  checkForLose();
  checkForWin();
  // drawBounds();
  // checkGameStatus();
  ball.posX += ball.velX;
  ball.posY += ball.velY;

  requestAnimationFrame(animate);
}

function updateDisplay() {
  lives.innerHTML = `Lives: ${livesCounter}`;
  level.innerHTML = `Level: ${levelCounter}`;
  score.innerHTML = `Score: ${scoreCounter * scoreMultiplier}`;
  if (scoreCounter > highScoreCounter) {
    highScoreCounter = scoreCounter;
    highScore.innerHTML = `High Score: ${highScoreCounter * scoreMultiplier}`;
  }
}

// function checkGameStatus() {}

function calculateHitDirection() {
  // console.clear();
  let degree = paddle.posX + paddle.width / 2 - ball.posX;
  if (degree === 0) {
    degree = 1;
  }
  if (degree >= 0) {
    degree = -Math.abs(degree);
  } else {
    degree = Math.abs(degree);
  }
  degree = degree.toFixed(2);
  let percentage = Number((degree / (paddle.width / 2)) * 100).toFixed(2);
  let newVelocity = (currentVelocity * percentage) / 100;
  return newVelocity;
}

function handleBallPaddleCollision() {
  // check if ball bottom hits paddle
  if (
    ball.posX >= paddle.posX &&
    ball.posX <= paddle.posX + paddle.width &&
    ball.posY + ball.size >= paddle.posY &&
    ball.posY + ball.size <= paddle.posY + paddle.height
  ) {
    playSound("audio/hitPaddle.mp3");
    ball.velY = -Math.abs(ball.velY);
    ball.velX = calculateHitDirection();
  }

  // check if ball top hits paddle
  if (
    ball.posX >= paddle.posX &&
    ball.posX <= paddle.posX + paddle.width &&
    ball.posY - ball.size >= paddle.posY &&
    ball.posY - ball.size <= paddle.posY + paddle.height
  ) {
    playSound("audio/hitPaddle.mp3");
    ball.velX = calculateHitDirection();
  }

  // check if ball left hits paddle
  if (
    ball.posY >= paddle.posY &&
    ball.posY <= paddle.posY + paddle.height &&
    ball.posX - ball.size >= paddle.posX &&
    ball.posX - ball.size <= paddle.posX + paddle.width
  ) {
    playSound("audio/hitPaddle.mp3");
    ball.velY = -Math.abs(ball.velY);
    ball.velX = calculateHitDirection();
  }

  // check if ball right hits paddle
  if (
    ball.posY >= paddle.posY &&
    ball.posY <= paddle.posY + paddle.height &&
    ball.posX + ball.size >= paddle.posX &&
    ball.posX + ball.size <= paddle.posX + paddle.width
  ) {
    playSound("audio/hitPaddle.mp3");
    ball.velY = -Math.abs(ball.velY);
    ball.velX = calculateHitDirection();
  }
}

function handleGameBounds() {
  if (ball.posX < 0 + ball.size || ball.posX > width - ball.size) {
    ball.velX = -ball.velX;
  }
  // remove OR condition when wanting to lose
  if (ball.posY < 0 + ball.size) {
    ball.velY = -ball.velY;
  }
}

function handlePaddleControls() {
  if (paddle.leftPressed) {
    // if the distance from left is less than paddle speed, set posX to 0
    if (paddle.posX <= paddle.speed) {
      paddle.posX = 0;

      return;
    } else {
      paddle.posX -= paddle.speed;
    }
    if (!gameStarted) {
      ball.posX = paddle.posX + paddle.width / 2;
    }
  }

  if (paddle.rightPressed) {
    // if the distance to right is less than paddle speed, set to width minus paddle width
    if (paddle.posX + paddle.width >= width - paddle.speed) {
      paddle.posX = width - paddle.width;
    } else {
      paddle.posX += paddle.speed;
    }
    if (!gameStarted) {
      ball.posX = paddle.posX + paddle.width / 2;
    }
  }
}

function handleEnterGame() {
  welcomeScreen.style.display = "none";
  canvas.style.display = "block";
  onWelcomeScreen = false;
  // gameStarted = true;
}

function getRandomLaunchVelocity() {
  const posOrNeg = Math.random();
  const randomPercentage = Math.random();
  if (posOrNeg < 0.5) {
    return -Math.abs(currentVelocity * randomPercentage);
  } else {
    return Math.abs(currentVelocity * randomPercentage);
  }
}

function handlePressSpace() {
  ball.velX = getRandomLaunchVelocity();
  ball.velY = -Math.abs(currentVelocity);
  gameStarted = true;
}

function handleKeyDown(e) {
  if (!gameStarted && onWelcomeScreen && e.code === "Enter") {
    handleEnterGame();
  }
  if (!gameStarted && !onWelcomeScreen && e.code === "Space") {
    handlePressSpace();
  }
  if (e.code === "ArrowLeft" || e.code === "KeyA") {
    paddle.leftPressed = true;
    return;
  }
  if (e.code === "ArrowRight" || e.code === "KeyD") {
    paddle.rightPressed = true;
    return;
  }
}

function handleKeyUp(e) {
  if (e.code === "ArrowLeft" || e.code === "KeyA") {
    paddle.leftPressed = false;
    return;
  }
  if (e.code === "ArrowRight" || e.code === "KeyD") {
    paddle.rightPressed = false;
    return;
  }
}

function addListeners() {
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

function start() {
  requestAnimationFrame(animate);

  addListeners();
}

start();

// bugs found for future:
// check which side of ball hit the top of which side of the paddle, to avoid cutting from behind sending the ball the opposite direction
