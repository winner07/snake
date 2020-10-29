class Snake {
  static getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  static levelSpeed = {
    hard: 100,
    medium: 300,
    low: 500
  };

  static directionsEnum = {
    TOP: 'TOP',
    RIGHT: 'RIGHT',
    DOWN: 'DOWN',
    LEFT: 'LEFT'
  };

  gameCanvasEl = document.getElementById('game_canvas');
  gameScoreEl = document.getElementById('game_score');
  gameCtx = this.gameCanvasEl.getContext('2d');
  fieldWidth = this.gameCanvasEl.width;
  fieldHeight = this.gameCanvasEl.height;
  snakeSize = 20;
  xLen = this.fieldWidth / this.snakeSize - 1;
  yLen = this.fieldHeight / this.snakeSize - 1;
  snakeCoords;
  foodCoords;
  directions = [Snake.directionsEnum.RIGHT];
  speed = Snake.levelSpeed.hard;
  isSpeedFaster = false;
  isSpeedLower = false;
  gameStatus = 'start';
  gameAnimationTimestamp;
  score = 0;
  appleImage;
  foodEaten = false;

  constructor() {
    this.init();
  }

  async init() {
    await this.loadFoodImage();
    this.addkeyEvents();
    this.gameStart();
  }

  addkeyEvents() {
    window.addEventListener('keydown', (e) => {
      const lastDirection = this.directions[this.directions.length - 1];

      switch(e.code) {
        case 'ArrowUp':
          if(lastDirection !== Snake.directionsEnum.DOWN) {
            this.directions.push(Snake.directionsEnum.TOP);
          }
          e.preventDefault();
          break;
        case 'ArrowRight':
          if(lastDirection !== Snake.directionsEnum.LEFT) {
            this.directions.push(Snake.directionsEnum.RIGHT);
          }
          e.preventDefault();
          break;
        case 'ArrowDown':
          if(lastDirection !== Snake.directionsEnum.TOP) {
            this.directions.push(Snake.directionsEnum.DOWN);
          }
          e.preventDefault();
          break;
        case 'ArrowLeft':
          if(lastDirection !== Snake.directionsEnum.RIGHT) {
            this.directions.push(Snake.directionsEnum.LEFT);
          }
          e.preventDefault();
          break;
        case 'Space':
          this.gameTogglePause();
          e.preventDefault();
          break;
        case 'KeyF':
          this.isSpeedFaster = true;
          e.preventDefault();
          break;
        case 'KeyL':
          this.isSpeedLower = true;
          e.preventDefault();
          break;
        case 'KeyN':
          this.gameStart();
          e.preventDefault();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch(e.code) {
        case 'KeyF':
          this.isSpeedFaster = false;
          e.preventDefault();
          break;
        case 'KeyL':
          this.isSpeedLower = false;
          e.preventDefault();
          break;
      }
    });
  }

  loadFoodImage() {
    this.appleImage = new Image();
    this.appleImage.src = 'img/apple.png';

    return new Promise((resolve) => {
      this.appleImage.addEventListener('load', resolve);
    });
  }

  gameStart() {
    this.gameStatus = 'start';
    this.setStartSnakeCoords();
    this.directions = [Snake.directionsEnum.RIGHT];
    this.foodCoords = this.getFoodCoords();
    this.score = 0;
    this.foodEaten = false;
    this.gameAnimationTimestamp = undefined;
    this.gameScoreEl.innerText = this.score;
    requestAnimationFrame(this.gameAnimation.bind(this));
  }

  gameStop() {
    this.gameStatus = 'stop';
    alert(`you lose, your score ${this.score}`);
  }

  gameTogglePause() {
    if(this.gameStatus === 'start') {
      this.gameStatus = 'paused';
    } else if(this.gameStatus === 'paused') {
      this.gameStatus = 'start';
      requestAnimationFrame(this.gameAnimation.bind(this));
    }
  }

  gameAnimation(timestamp) {
    if(!this.gameAnimationTimestamp) {
      this.gameAnimationTimestamp = timestamp;
    }

    const elapsed = timestamp - this.gameAnimationTimestamp;
    const currentSpeed = this.isSpeedFaster
      ? this.speed / 2
      : this.isSpeedLower
        ? this.speed * 2
        : this.speed;

    if(elapsed >= currentSpeed) {
      this.gameAnimationTimestamp = undefined;

      this.gameCtx.clearRect(0, 0, this.fieldWidth, this.fieldHeight);
      this.moveSnake();
      this.drawFood();
      this.drawSnake();
      this.checkColisions();

      if(this.gameStatus === 'start') {
        this.eatFood();
      } else {
        return;
      }
    }

    window.requestAnimationFrame(this.gameAnimation.bind(this));
  }

  drawFood() {
    if(this.foodEaten){
      this.foodCoords = this.getFoodCoords();
      this.foodEaten = false;
    }

    this.gameCtx.drawImage(
      this.appleImage,
      this.foodCoords.x * this.snakeSize,
      this.foodCoords.y * this.snakeSize,
      this.snakeSize,
      this.snakeSize
    );
  }

  getFoodCoords() {
    const freeCoords = [];

    for(let x = 0; x <= this.xLen; x++) {
      for(let y = 0; y <= this.yLen; y++) {
        if(this.snakeCoords.findIndex((coords) => coords.x === x && coords.y === y) === -1) {
          freeCoords.push({x, y});
        }
      }
    }

    return freeCoords[Snake.getRandomInt(0, freeCoords.length)];
  }

  setStartSnakeCoords() {
    const startX = Math.floor(this.fieldWidth / this.snakeSize / 2 - 2);
    const startY = Math.floor(this.fieldHeight / this.snakeSize / 2 - 1);

    this.snakeCoords = [
      {x: startX, y: startY},
      {x: startX + 1, y: startY},
      {x: startX + 2, y: startY}
    ];
  }

  moveSnake() {
    const snakeTail = this.snakeCoords.shift();
    const snakeHead = this.snakeCoords[this.snakeCoords.length - 1];

    if(this.directions.length > 1){
      this.directions.shift();
    }

    let direction = this.directions[0];

    switch(direction) {
      case Snake.directionsEnum.TOP:
        snakeTail.x = snakeHead.x;
        snakeTail.y = snakeHead.y - 1;
        break;
      case Snake.directionsEnum.RIGHT:
        snakeTail.x = snakeHead.x + 1;
        snakeTail.y = snakeHead.y;
        break;
      case Snake.directionsEnum.DOWN:
        snakeTail.x = snakeHead.x;
        snakeTail.y = snakeHead.y + 1;
        break;
      case Snake.directionsEnum.LEFT:
        snakeTail.x = snakeHead.x - 1;
        snakeTail.y = snakeHead.y;
        break;
    }

    this.snakeCoords.push(snakeTail);
  }

  checkColisions() {
    const snakeHead = this.snakeCoords[this.snakeCoords.length - 1];

    switch(this.directions[0]){
      case Snake.directionsEnum.TOP:
        if(snakeHead.y === -1){
          this.gameStop();
        }
        break;
      case Snake.directionsEnum.RIGHT:
        if(snakeHead.x === this.xLen + 1){
          this.gameStop();
        }
        break;
      case Snake.directionsEnum.DOWN:
        if(snakeHead.y === this.yLen + 1){
          this.gameStop();
        }
        break;
      case Snake.directionsEnum.LEFT:
        if(snakeHead.x === -1){
          this.gameStop();
        }
        break;
    }

    const isColisionSelf = this.snakeCoords.some((coord, i) => {
      return i !== this.snakeCoords.length - 1 && coord.x === snakeHead.x && coord.y === snakeHead.y
    });

    if(isColisionSelf) {
      this.gameStop();
    }
  }

  drawSnake() {
    for(let i = 0, size = this.snakeCoords.length; i < size; i++){
      this.gameCtx.fillStyle = i === size - 1 ? '#ffb700' : '#ffe600';
      this.gameCtx.fillRect(
        this.snakeCoords[i].x * this.snakeSize,
        this.snakeCoords[i].y * this.snakeSize,
        this.snakeSize,
        this.snakeSize
      );
    }
  }

  eatFood() {
    const snakeHead = this.snakeCoords[this.snakeCoords.length - 1];

    if(snakeHead.x === this.foodCoords.x && snakeHead.y === this.foodCoords.y) {
      this.gameScoreEl.innerText = ++this.score;
      this.snakeCoords.push(this.foodCoords);
      this.foodEaten = true;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const snake = new Snake();
});