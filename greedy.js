class Greedy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  calcDistance(xs, ys) {
    return Math.abs(xs[0] - xs[1]) + Math.abs(ys[0] - ys[1]);
  }

  getMovesSorted(possibleMoves, foodCoor, snakeBody) {
    snakeBody.forEach((snakeE) => {
      possibleMoves = possibleMoves.filter(
        (moveE) => !(moveE[0] === snakeE[0] && moveE[1] === snakeE[1])
      );
    });
    possibleMoves = possibleMoves.filter(
      (moveE) => moveE[0] >= 0 && moveE[0] < this.x && moveE[1] >= 0 && moveE[1] < this.y
    );
    if (possibleMoves.length === 0) {
      return [];
    }
    possibleMoves = possibleMoves.sort(
      (a, b) =>
        this.calcDistance([a[0], foodCoor[0]], [a[1], foodCoor[1]]) -
        this.calcDistance([b[0], foodCoor[0]], [b[1], foodCoor[1]])
    );

    return possibleMoves;
  }
}
