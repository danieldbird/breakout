// get canvas and set context
const canvas = document.querySelector(".canvas");
const ctx = canvas.getContext("2d");

// set the width and height to the canvas width and height
const width = canvas.getBoundingClientRect().width;
const height = canvas.getBoundingClientRect().height;

canvas.width = width;
canvas.height = height;

// get page elements
const welcomeScreen = document.querySelector(".welcome");

const lives = document.querySelector(".lives");
const level = document.querySelector(".level");
const score = document.querySelector(".score");
const highScore = document.querySelector(".highScore");

const message = document.querySelector(".message");

// define game variables
const game = {
  velocity: 5,
  lives: 3,
  level: 1,
  score: 0,
  highScore: window.localStorage.getItem("highScore")
    ? window.localStorage.getItem("highScore")
    : 0,
  scoreMultiplier: 100,
  ball: {
    size: 10,
  },
  state: {
    onWelcomeScreen: true,
    started: false,
  },
};

// define paddle variables
const paddle = {
  width: 150,
  height: 20,
  posX: width / 2 - 150 / 2,
  posY: height - 20 * 2,
  leftPressed: false,
  rightPressed: false,
  speed: 5,
};

// define ball variables
const ball = {
  posX: width / 2,
  posY: paddle.posY - game.ball.size - 1,
  velX: 0,
  velY: 0,
};

// define brick layout variables
const brickLayout = {
  rows: 1,
  columns: 2,
  height: 20,
  padding: 10,
  offset: 80,
};

// define brick data variables, and brick width depending on the width of the canvas, and brick layout
const brickData = {
  bricks: [],
  totalBricksGenerated: 0,
  brickWidth:
    (width -
      brickLayout.offset -
      (brickLayout.offset / brickLayout.columns) * brickLayout.columns -
      brickLayout.padding * (brickLayout.columns - 1)) /
    brickLayout.columns,
};

// UTILITIES ---------------------------------------------------------------------------------------

function resetGame() {
  game.velocity = 5;
  game.lives = 3;
  game.level = 1;
  game.score = 0;
  brickData.totalBricksGenerated = 0;
  brickData.bricks = [];
  brickLayout.rows = 1;
  brickLayout.columns = 2;
  paddle.speed = 5;
  // generateBricks();
  welcomeScreen.style.display = "block";
  canvas.style.display = "none";
  game.state.onWelcomeScreen = true;
}

// play a game sound
function playSound(file) {
  let audio = new Audio(file);
  audio.play();
}

// rest the ball position to on top of paddle
function resetBall() {
  ball.posX = paddle.posX + paddle.width / 2;
  ball.posY = paddle.posY - game.ball.size - 1;
  ball.velX = 0;
  ball.velY = 0;
}

// display a message
function showMessage(text, time) {
  message.innerHTML = text;
  message.style.opacity = "1";
  setTimeout(() => {
    message.style.opacity = "0";
  }, time);
}

// return a random launch velocity
function getRandomLaunchVelocity() {
  const posOrNeg = Math.random();
  const randomPercentage = Math.random();
  if (posOrNeg < 0.5) {
    return -Math.abs(game.velocity * randomPercentage);
  } else {
    return Math.abs(game.velocity * randomPercentage);
  }
}

// depending where on the paddle the ball hits, calculate a bounce direction
function calculateHitDirection() {
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
  let newVelocity = (game.velocity * percentage) / 100;
  return newVelocity;
}

// generate bricks using the current brick data
function generateBricks() {
  brickData.brickWidth =
    (width -
      brickLayout.offset -
      (brickLayout.offset / brickLayout.columns) * brickLayout.columns -
      brickLayout.padding * (brickLayout.columns - 1)) /
    brickLayout.columns;
  for (let i = 0; i < brickLayout.columns; i++) {
    brickData.bricks[i] = [];
    for (let j = 0; j < brickLayout.rows; j++) {
      brickData.bricks[i][j] = { posX: 0, posY: 0, status: 1 };
      brickData.totalBricksGenerated += 1;
    }
  }
}

// update the display elements
function updateDisplay() {
  lives.innerHTML = `Lives: ${game.lives}`;
  level.innerHTML = `Level: ${game.level}`;
  score.innerHTML = `Score: ${game.score * game.scoreMultiplier}`;

  if (game.score > game.highScore) {
    game.highScore = game.score;
    window.localStorage.setItem("highScore", game.highScore);
    highScore.innerHTML = `High Score: ${game.highScore * game.scoreMultiplier}`;
  } else {
    highScore.innerHTML = `High Score: ${game.highScore * game.scoreMultiplier}`;
  }
}

// DRAWING GAME OBJECTS ----------------------------------------------------------------------------

// draw the bricks each frame using the brick data
function drawBricks() {
  for (let i = 0; i < brickLayout.columns; i++) {
    for (let j = 0; j < brickLayout.rows; j++) {
      if (brickData.bricks[i][j].status == 1) {
        const posX = i * (brickData.brickWidth + brickLayout.padding) + brickLayout.offset;
        const posY = j * (brickLayout.height + brickLayout.padding) + brickLayout.offset;
        brickData.bricks[i][j].posX = posX;
        brickData.bricks[i][j].posY = posY;
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(posX, posY, posX, posY + brickLayout.height);
        gradient.addColorStop(0, "#8E00E5");
        gradient.addColorStop(1, "#4D00F0");
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;
        ctx.shadowColor = "black";
        ctx.fillStyle = gradient;
        ctx.rect(posX, posY, brickData.brickWidth, brickLayout.height);
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

// draw the ball each frame using the current ball position data
function drawBall() {
  ctx.shadowColor = "#333";
  ctx.beginPath();
  ctx.fillStyle = "#ccc";
  ctx.arc(ball.posX, ball.posY, game.ball.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

// draw the paddle each frame using the current paddle data
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

// COLLISION DETECTION -----------------------------------------------------------------------------

function ballPaddleCollisionDetection() {
  // check if ball bottom hits paddle
  if (
    ball.posX >= paddle.posX &&
    ball.posX <= paddle.posX + paddle.width &&
    ball.posY + game.ball.size >= paddle.posY &&
    ball.posY + game.ball.size <= paddle.posY + paddle.height
  ) {
    playSound("audio/hitPaddle.mp3");
    ball.velY = -Math.abs(ball.velY);
    ball.velX = calculateHitDirection();
  }

  // check if ball top hits paddle
  if (
    ball.posX >= paddle.posX &&
    ball.posX <= paddle.posX + paddle.width &&
    ball.posY - game.ball.size >= paddle.posY &&
    ball.posY - game.ball.size <= paddle.posY + paddle.height
  ) {
    playSound("audio/hitPaddle.mp3");
    ball.velX = calculateHitDirection();
  }

  // check if ball left hits paddle
  if (
    ball.posY >= paddle.posY &&
    ball.posY <= paddle.posY + paddle.height &&
    ball.posX - game.ball.size >= paddle.posX &&
    ball.posX - game.ball.size <= paddle.posX + paddle.width
  ) {
    playSound("audio/hitPaddle.mp3");
    ball.velY = -Math.abs(ball.velY);
    ball.velX = calculateHitDirection();
  }

  // check if ball right hits paddle
  if (
    ball.posY >= paddle.posY &&
    ball.posY <= paddle.posY + paddle.height &&
    ball.posX + game.ball.size >= paddle.posX &&
    ball.posX + game.ball.size <= paddle.posX + paddle.width
  ) {
    playSound("audio/hitPaddle.mp3");
    ball.velY = -Math.abs(ball.velY);
    ball.velX = calculateHitDirection();
  }
}

function wallCollisionDetection() {
  if (ball.posX <= 0 + game.ball.size || ball.posX >= width - game.ball.size) {
    playSound("audio/hitWall.mp3");
    if (ball.posX <= 0 + game.ball.size) {
      ball.posX = 0 + game.ball.size;
    }
    if (ball.posX >= width - game.ball.size) {
      ball.posX = width - game.ball.size;
    }
    ball.velX = -ball.velX;
  }
  if (ball.posY < 0 + game.ball.size) {
    playSound("audio/hitWall.mp3");
    ball.velY = -ball.velY;
  }
}

// check if ball hits a brick
function brickCollisionDetection() {
  for (let i = 0; i < brickLayout.columns; i++) {
    for (let j = 0; j < brickLayout.rows; j++) {
      const brick = brickData.bricks[i][j];
      // check if top of ball hits a brick
      if (
        ball.posX >= brick.posX &&
        ball.posX <= brick.posX + brickData.brickWidth &&
        ball.posY - game.ball.size >= brick.posY &&
        ball.posY - game.ball.size <= brick.posY + brickLayout.height
      ) {
        playSound("audio/hitBrick.mp3");
        ball.velY = Math.abs(ball.velY);
        brick.status = 0;
        brick.posX = -1000;
        brick.posY = -1000;
        game.score += 1;
      }

      // check if bottom of ball hits a brick
      if (
        ball.posX >= brick.posX &&
        ball.posX <= brick.posX + brickData.brickWidth &&
        ball.posY + game.ball.size >= brick.posY &&
        ball.posY + game.ball.size <= brick.posY + brickLayout.height
      ) {
        playSound("audio/hitBrick.mp3");
        ball.velY = -Math.abs(ball.velY);
        brick.status = 0;
        brick.posX = -1000;
        brick.posY = -1000;
        game.score += 1;
      }

      // check if left side of ball hits a brick
      if (
        ball.posX - game.ball.size >= brick.posX &&
        ball.posX - game.ball.size <= brick.posX + brickData.brickWidth &&
        ball.posY >= brick.posY &&
        ball.posY <= brick.posY + brickLayout.height
      ) {
        playSound("audio/hitBrick.mp3");
        ball.velX = -ball.velX;
        brick.status = 0;
        brick.posX = -1000;
        brick.posY = -1000;
        game.score += 1;
      }

      // check if right side of ball hits a brick
      if (
        ball.posX + game.ball.size >= brick.posX &&
        ball.posX + game.ball.size <= brick.posX + brickData.brickWidth &&
        ball.posY >= brick.posY &&
        ball.posY <= brick.posY + brickLayout.height
      ) {
        playSound("audio/hitBrick.mp3");
        ball.velX = -ball.velX;
        brick.status = 0;
        brick.posX = -1000;
        brick.posY = -1000;
        game.score += 1;
      }
    }
  }
}

// GAME RULES --------------------------------------------------------------------------------------

// check for win level
function checkForWin() {
  if (game.score === brickData.totalBricksGenerated) {
    game.level += 1;
    showMessage(`LEVEL ${game.level}`, 2000);
    game.state.started = false;
    game.velocity += 1.25;
    if (brickLayout.rows < 5) {
      brickLayout.rows += 1;
    }
    if (brickLayout.columns < 10) {
      brickLayout.columns += 1;
    }
    paddle.speed += 1.25;
    resetBall();
    generateBricks();
  }
}

// check if ball is missed by paddle
function checkForLose() {
  if (ball.posY > height + game.ball.size) {
    resetBall();
    game.lives -= 1;
    game.state.started = false;
    if (game.lives === 0) {
      game.state.onWelcomeScreen = true;
      // do this to reload the page.
      // save highscore in localstorage
      // document.location.reload();

      showMessage("GAME OVER!", 1000);
      setTimeout(() => {
        resetGame();
        generateBricks();
      }, 2000);
    } else {
      showMessage("MISS!", 500);
    }
  }
}

// CONTROLS ----------------------------------------------------------------------------------------

function handlePaddleControls() {
  if (paddle.leftPressed) {
    // if the distance from left is less than paddle speed, set posX to 0
    if (paddle.posX <= paddle.speed) {
      paddle.posX = 0;
    } else {
      paddle.posX -= paddle.speed;
    }
    if (!game.state.started) {
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
    if (!game.state.started) {
      ball.posX = paddle.posX + paddle.width / 2;
    }
  }
}

function handlePressSpace() {
  ball.velX = getRandomLaunchVelocity();
  ball.velY = -Math.abs(game.velocity);
  game.state.started = true;
}

function handlePressEnter() {
  welcomeScreen.style.display = "none";
  canvas.style.display = "block";
  game.state.onWelcomeScreen = false;
  showMessage(`LEVEL ${game.level}`, 2000);
}

// handle any key down
function handleKeyDown(e) {
  if (!game.state.started && game.state.onWelcomeScreen && e.code === "Enter") {
    handlePressEnter();
  }
  if (!game.state.started && !game.state.onWelcomeScreen && e.code === "Space") {
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

// handle any key up
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

// LISTENERS ---------------------------------------------------------------------------------------

function addListeners() {
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

// ANIMATION FRAME ---------------------------------------------------------------------------------
function animate() {
  ctx.clearRect(0, 0, width, height);
  drawBricks();
  drawBall();
  drawPaddle();
  brickCollisionDetection();
  wallCollisionDetection();
  ballPaddleCollisionDetection();
  handlePaddleControls();
  updateDisplay();
  checkForLose();
  checkForWin();
  // move the ball position using its velocity every frame
  ball.posX += ball.velX;
  ball.posY += ball.velY;
  requestAnimationFrame(animate);
}

// START GAME --------------------------------------------------------------------------------------
function start() {
  requestAnimationFrame(animate);
  generateBricks();
  addListeners();
}

start();
