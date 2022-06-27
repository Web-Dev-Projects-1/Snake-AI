class Snake {
  constructor(X, Y) {
    this.width = X;
    this.height = Y;
    let startX = Math.floor(X / 2);
    let startY = Math.floor(Y / 2);
    this.body = [
      [startX, startY - 2],
      [startX, startY - 1],
      [startX, startY]
    ];
    // 0 = up, 1 = down, 2 = right, 3 = left
    this.moveDict = {0: [0, -1], 1: [0, 1], 2: [1, 0], 3: [-1, 0]};
    this.direction = 0;
    this.growing = false;
    this.collided = false;
  }

  getDirection() {
    return this.direction;
  }

  changeDirection(num) {
    if (!this.bodyInTheWay(num)) {
      this.direction = num;
    }
  }

  move() {
    this.checkForCollision();

    if (!this.collided) {
      if (this.growing) {
        this.growBody();
      } else {
        // moving the body
        for (let i = this.body.length - 1; i > 0; i--) {
          this.body[i][0] = this.body[i - 1][0];
          this.body[i][1] = this.body[i - 1][1];
        }
        // moving the head
        let move = this.moveDict[this.direction];
        this.body[0][0] += move[0];
        this.body[0][1] += move[1];
      }
      this.growing = false;
    }
  }

  toGrow() {
    this.growing = true;
  }

  growBody() {
    let head = [this.body[0][0], this.body[0][1]];
    let move = this.moveDict[this.direction];
    this.body.unshift([(head[0] += move[0]), (head[1] += move[1])]);
  }

  bodyInTheWay(num) {
    let move = this.moveDict[num];
    return (
      this.body[0][0] + move[0] === this.body[1][0] &&
      this.body[0][1] + move[1] === this.body[1][1]
    );
  }

  checkForCollision() {
    let move = this.moveDict[this.direction];
    let headNextPos = [this.body[0][0] + move[0], this.body[0][1] + move[1]];

    snakeBody.forEach((e, i) => {
      if (
        (i > 1 && headNextPos[0] === e[0] && headNextPos[1] === e[1]) ||
        headNextPos[0] < 0 ||
        headNextPos[0] > this.width - 1 ||
        headNextPos[1] < 0 ||
        headNextPos[1] > this.height - 1
      ) {
        this.collided = true;
      }
    });
  }
}
