const result = document.querySelector("#result");

let squareSize = 30;
let width = 20;
let height = 10;
let windowSize = [squareSize * width, squareSize * height];
let snake, snakeBody, snakeHead;
let food, foodCoor;
let greedy = new Greedy(width, height);
let hamiltonian = new Hamiltonian();
let hamilCycle = hamiltonian.findHamilCycle(height / 2, width / 2);

function preload() {
  top_img = loadImage("images/top.png");
  left_img = loadImage("images/left.png");
  right_img = loadImage("images/right.png");
  bottom_img = loadImage("images/bottom.png");
  top_bottom_img = loadImage("images/top_bottom.png");
  left_right_img = loadImage("images/left_right.png");
  top_left_img = loadImage("images/top_left.png");
  top_right_img = loadImage("images/top_right.png");
  left_bottom_img = loadImage("images/left_bottom.png");
  right_bottom_img = loadImage("images/right_bottom.png");
  food_img = loadImage("images/food.png");
}

function setup() {
  snake = new Snake(width, height);
  food = new Food(width, height);
  snakeBody = snake.body;
  foodCoor = food.spawn(snake.body);
  // game loop
  moveSnake = setInterval(() => {
    // finding next move based on hamiltonian cycle and greedy alg
    nextBestMove();
    snake.move();

    snakeBody = snake.body;
    snakeBody.forEach((e) => {
      if (e[0] === foodCoor[0] && e[1] === foodCoor[1]) {
        foodCoor = food.spawn(snakeBody);
        snake.toGrow();
      }
    });
    if (snake.collided) {
      result.innerText = "You lost!";
      result.style.color = "black";
      clearInterval(moveSnake);
    } else if (snakeBody.length === width * height) {
      result.innerText = "You won!";
      result.style.color = "black";
      clearInterval(moveSnake);
    }
  }, 40);

  let myCanvas = createCanvas(windowSize[0], windowSize[1]);
  myCanvas.parent("snake-window");
}

function draw() {
  background(0);
  noStroke();
  // displaying food
  image(food_img, foodCoor[0] * squareSize, foodCoor[1] * squareSize, squareSize, squareSize);
  snakeBody = snake.body;
  let left, right, top, bottom;
  // displaying the right snake square based on neighbors
  for (let i = 0; i < snakeBody.length; i++) {
    left = false;
    right = false;
    top = false;
    bottom = false;
    for (j = i - 1; j < i + 2; j += 2) {
      if (j >= 0 && j < snakeBody.length) {
        if (snakeBody[j][0] === snakeBody[i][0] + 1) {
          right = true;
        }
        if (snakeBody[j][0] === snakeBody[i][0] - 1) {
          left = true;
        }
        if (snakeBody[j][1] === snakeBody[i][1] - 1) {
          top = true;
        }
        if (snakeBody[j][1] === snakeBody[i][1] + 1) {
          bottom = true;
        }
      }
    }

    if (top && !left && !right && bottom) {
      image(top_bottom_img, snakeBody[i][0] * squareSize, snakeBody[i][1] * squareSize, squareSize, squareSize);
    } else if (!top && left && right && !bottom) {
      image(left_right_img, snakeBody[i][0] * squareSize, snakeBody[i][1] * squareSize, squareSize, squareSize);
    } else if (top && left && !right && !bottom) {
      image(top_left_img, snakeBody[i][0] * squareSize, snakeBody[i][1] * squareSize, squareSize, squareSize);
    } else if (top && !left && right && !bottom) {
      image(top_right_img, snakeBody[i][0] * squareSize, snakeBody[i][1] * squareSize, squareSize, squareSize);
    } else if (!top && left && !right && bottom) {
      image(left_bottom_img, snakeBody[i][0] * squareSize, snakeBody[i][1] * squareSize, squareSize, squareSize);
    } else if (!top && !left && right && bottom) {
      image(right_bottom_img, snakeBody[i][0] * squareSize, snakeBody[i][1] * squareSize, squareSize, squareSize);
    } else if (top && !left && !right && !bottom) {
      image(top_img, snakeBody[i][0] * squareSize, snakeBody[i][1] * squareSize, squareSize, squareSize);
    } else if (!top && left && !right && !bottom) {
      image(left_img, snakeBody[i][0] * squareSize, snakeBody[i][1] * squareSize, squareSize, squareSize);
    } else if (!top && !left && right && !bottom) {
      image(right_img, snakeBody[i][0] * squareSize, snakeBody[i][1] * squareSize, squareSize, squareSize);
    } else if (!top && !left && !right && bottom) {
      image(bottom_img, snakeBody[i][0] * squareSize, snakeBody[i][1] * squareSize, squareSize, squareSize);
    }
  }
}

// 0 - UP, 1 = DOWN, 2 = RIGHT, 3 = LEFT
function keyPressed() {
  if (keyCode === UP_ARROW) {
    snake.changeDirection(0);
  } else if (keyCode === DOWN_ARROW) {
    snake.changeDirection(1);
  } else if (keyCode === RIGHT_ARROW) {
    snake.changeDirection(2);
  } else if (keyCode === LEFT_ARROW) {
    snake.changeDirection(3);
  } else if (keyCode === ENTER && snake.collided) {
    result.style.color = "transparent";
    setup();
  }
}

function nextBestMove() {
  snakeBody = snake.body;
  let snakeHead = snakeBody[0];
  let snakeTail = snakeBody[snakeBody.length - 1];
  let movesSorted = getGreedyBestMoves();
  let foundBestMove = false;
  let bestMoveInCycle;
  if (movesSorted.length === 0 || snakeBody.length > (width * height) / 2 - 1) {
    foundBestMove = false;
  }
  // making sure shortcuts are valid - are not located in between head and tail, and do not skip food in the cycle
  else {
    let snakeHeadInCycle = hamilCycle[snakeHead[1]][snakeHead[0]];
    let snakeTailInCycle = hamilCycle[snakeTail[1]][snakeTail[0]] - 1;
    let foodInCycle = hamilCycle[foodCoor[1]][foodCoor[0]];
    if (snakeTailInCycle === -1) {
      snakeTailInCycle = width * height - 1;
    }
    // converting into a path where snake's tail is 0
    let snakeTailValue = snakeTailInCycle;
    snakeTailInCycle -= snakeTailValue;
    snakeHeadInCycle -= snakeTailValue;
    snakeHeadInCycle += snakeHeadInCycle < 0 ? width * height : 0;
    foodInCycle -= snakeTailValue;
    foodInCycle += foodInCycle < 0 ? width * height : 0;

    for (let i = 0; i < movesSorted.length; i++) {
      bestMoveInCycle = hamilCycle[movesSorted[i][1]][movesSorted[i][0]];
      bestMoveInCycle -= snakeTailValue;
      bestMoveInCycle += bestMoveInCycle < 0 ? width * height : 0;
      if (bestMoveInCycle > snakeHeadInCycle) {
        foundBestMove = true;
        if (
          !(foodInCycle > snakeTailInCycle && foodInCycle < snakeHeadInCycle) &&
          foodInCycle < bestMoveInCycle
        ) {
          foundBestMove = false;
        }
      }

      if (foundBestMove) {
        bestMoveInCycle = hamilCycle[movesSorted[i][1]][movesSorted[i][0]];
        break;
      }
    }
  }

  let nextHamil;
  if (foundBestMove) {
    nextHamil = bestMoveInCycle;
  } else {
    nextHamil = hamilCycle[snakeHead[1]][snakeHead[0]] + 1;
    if (nextHamil === width * height) {
      nextHamil = 0;
    }
  }

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (hamilCycle[i][j] === nextHamil) {
        nextMove(j, i);
        return;
      }
    }
  }
}

function getGreedyBestMoves() {
  let snakeDirection = snake.getDirection();
  snakeBody = snake.body;
  let snakeHead = snakeBody[0];
  let topCoor = [snakeHead[0], snakeHead[1] - 1];
  let bottomCoor = [snakeHead[0], snakeHead[1] + 1];
  let leftCoor = [snakeHead[0] - 1, snakeHead[1]];
  let rightCoor = [snakeHead[0] + 1, snakeHead[1]];
  let possibleMoves;

  if (snakeDirection === 0) {
    possibleMoves = [topCoor, leftCoor, rightCoor];
  } else if (snakeDirection === 1) {
    possibleMoves = [leftCoor, rightCoor, bottomCoor];
  } else if (snakeDirection === 2) {
    possibleMoves = [topCoor, rightCoor, bottomCoor];
  } else {
    possibleMoves = [topCoor, leftCoor, bottomCoor];
  }

  return greedy.getMovesSorted(possibleMoves, foodCoor, snakeBody);
}

function nextMove(i, j) {
  if (j < snakeBody[0][1]) {
    snake.changeDirection(0);
  }
  if (j > snakeBody[0][1]) {
    snake.changeDirection(1);
  }
  if (i > snakeBody[0][0]) {
    snake.changeDirection(2);
  }
  if (i < snakeBody[0][0]) {
    snake.changeDirection(3);
  }
}
