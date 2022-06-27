class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  spawn(snakeBody) {
    let possibleSpots = [...Array(this.x * this.y).keys()];
    snakeBody.forEach((snakeE) => {
      possibleSpots = possibleSpots.filter((foodE) => {
        return foodE !== snakeE[1] * this.x + snakeE[0];
      });
    });
    let randomSpot = possibleSpots[Math.floor(Math.random() * possibleSpots.length)];
    return [randomSpot % this.x, Math.floor(randomSpot / this.x)];
  }
}
