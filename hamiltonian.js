class Hamiltonian {
  findHamilCycle(x, y) {
    let adjMatrix = this.constructAdjMatrix(x, y);
    let mazeMatrix = this.primsMaze(adjMatrix);
    let hamilMatrix = this.hamilCycle(mazeMatrix, x, y);
    return hamilMatrix;
  }

  constructAdjMatrix(x, y) {
    let arr = [];
    for (let i = 0; i < x * y; i++) {
      arr[i] = [];
      for (let j = 0; j < x * y; j++) {
        arr[i][j] = 0;
      }
    }
    // marking all neighbors of each square as connected
    for (let i = 0; i < arr.length; i++) {
      if (Math.floor(i / y) !== 0 && i - y >= 0) {
        arr[i - y][i] = 1;
        arr[i][i - y] = 1;
      }
      if (i % y !== 0 && i - 1 >= 0) {
        arr[i - 1][i] = 1;
        arr[i][i - 1] = 1;
      }
      if (i % y !== y - 1 && i + 1 < x * y) {
        arr[i + 1][i] = 1;
        arr[i][i + 1] = 1;
      }
      if (Math.floor(i / y) !== y - 1 && i + y < x * y) {
        arr[i + y][i] = 1;
        arr[i][i + y] = 1;
      }
    }

    return arr;
  }

  // PRIMS = generate a maze from the adjacency matrix
  primsMaze(adjMatrix) {
    let mazeMatrix = [];
    for (let i = 0; i < adjMatrix.length; i++) {
      mazeMatrix[i] = [];
      for (let j = 0; j < adjMatrix.length; j++) {
        mazeMatrix[i][j] = 0;
      }
    }

    let visited = [];
    let neighbors = [];
    let tempNeighbors = [];
    let randomNeighbor;
    // first element
    let curr = Math.floor(Math.random() * adjMatrix.length);

    while (visited.length < adjMatrix.length - 1) {
      visited.push(curr);
      for (let i = 0; i < adjMatrix[curr].length; i++) {
        if (adjMatrix[curr][i] !== 0) {
          if (!visited.includes(i) && !neighbors.includes(i)) {
            neighbors.push(i);
          }
        }
      }
      tempNeighbors = [];
      curr = neighbors[Math.floor(Math.random() * neighbors.length)];
      for (let i = 0; i < visited.length; i++) {
        if (adjMatrix[curr][visited[i]] !== 0) {
          tempNeighbors.push(visited[i]);
        }
      }
      randomNeighbor = tempNeighbors[Math.floor(Math.random() * tempNeighbors.length)];
      mazeMatrix[curr][randomNeighbor] = 1;
      mazeMatrix[randomNeighbor][curr] = 1;
      neighbors.splice(neighbors.indexOf(curr), 1);
    }

    return mazeMatrix;
  }

  matrixContains(matrix, val) {
    return matrix.some((row) => row.includes(val));
  }

  // generate a hamiltonian cycle from the maze by using the wall following algorithm
  hamilCycle(mazeMatrix, x, y) {
    // DFS ALGORITHM TO TRAVERSE THE MAZE USING WALL FOLLOWING ALGORITHM

    let visited = [];
    let directionNodes = {};
    let path = [];
    let neighbors = {};
    // to show turn priority when traversing maze
    let turner;

    for (let i = 0; i < mazeMatrix.length; i++) {
      neighbors[i] = [];
      directionNodes[i] = [];
    }
    if (mazeMatrix[0][1] !== 0) {
      directionNodes[0] = "right";
      // turning left when possible, if path goes to the right
      turner = {
        right: [-y, 1, y, -1],
        up: [-1, -y, 1, y],
        left: [y, -1, -y, 1],
        down: [1, y, -1, -y]
      };
    } else {
      directionNodes[0] = "down";
      // turning right when possible if path goes down
      turner = {
        right: [y, 1, -y, -1],
        up: [1, -y, -1, y],
        left: [-y, -1, y, 1],
        down: [-1, y, 1, -y]
      };
    }
    // 1 = right, -1 = left, y = down, -y = up
    let right = 1;
    let left = -1;
    let up = -y;
    let down = y;
    let directions = {};
    directions[right] = "right";
    directions[left] = "left";
    directions[up] = "up";
    directions[down] = "down";
    // generate a wall following path through the maze
    function DFS(node) {
      path.push(node);
      visited.push(node);
      for (let i = 0; i < mazeMatrix[node].length; i++) {
        if (mazeMatrix[node][i] !== 0) {
          neighbors[node].push(i);
        }
      }
      let moves = turner[directionNodes[node]];
      for (let i = 0; i < moves.length; i++) {
        if (neighbors[node].includes(node + moves[i]) && !visited.includes(node + moves[i])) {
          directionNodes[node + moves[i]] = directions[moves[i]];
          DFS(node + moves[i]);
          path.push(node);
        }
      }
    }

    DFS(0);
    path.push(path[path.length - 2]);

    // CONVERT WALL FOLLOWING PATH INTO HAMILTONIAN MATRIX

    let hamilMatrix = [];
    for (let i = 0; i < x * 2; i++) {
      hamilMatrix[i] = [];
      for (let j = 0; j < y * 2; j++) {
        hamilMatrix[i][j] = -1;
      }
    }

    let currIndex = [0, 0];
    let lastDirection;
    hamilMatrix[0][0] = 0;
    let counter = 1;
    let amount = 0;
    let subtract = 0;
    let oppositeDir = {};
    oppositeDir[right] = "left";
    oppositeDir[left] = "right";
    oppositeDir[up] = "down";
    oppositeDir[down] = "up";

    for (let i = 1; i < path.length + 1; i++) {
      if (!this.matrixContains(hamilMatrix, -1)) {
        break;
      }

      subtract = 0;
      amount = 0;
      let nextDiff = path[i] - path[i - 1];
      let nextDir = directions[nextDiff];
      if (lastDirection === oppositeDir[nextDiff]) {
        nextDir === "right" || nextDir === "left"
          ? aroundHorizontal(path[i - 1])
          : aroundVertical(path[i - 1]);
        i--;
      } else {
        while (i < path.length && path[i] - path[i - 1] === nextDiff) {
          amount++;
          i++;
        }
        // if next direction is right or left = looking at current row, else column
        let index = nextDir === "right" || nextDir === "left" ? 0 : 1;
        let arcCheck =
          nextDir === "right" || nextDir === "left"
            ? [
                [-y, 0],
                [y, 1]
              ]
            : [
                [1, 1],
                [-1, 0]
              ];
        arcCheck = arcCheck.filter((e) => {
          return e[0] === path[i] - path[i - 1];
        });
        if (arcCheck.length > 0) {
          if (currIndex[index] % 2 === arcCheck[0][1]) {
            subtract = 1;
            if (checkForArcs(path, i)) {
              subtract += 1;
            }
          } else {
            let res = calcTillTheEnd(nextDir, i - 1);
            amount = res[0];
            subtract = res[1];
          }
        }
        if (i - 2 > 0) {
          if (path[i - 2] === path[i]) {
            let res = calcTillTheEnd(nextDir, i - 1);
            amount = res[0];
            subtract = res[1];
          }
        }
        i--;
        goByAmount(nextDir, amount, subtract);
      }
    }

    function aroundVertical(node) {
      let shift = (node % y) * 2 + 1;
      if (currIndex[1] === shift) {
        goByAmount("left", 0, 0);
      } else {
        goByAmount("right", 0, 0);
      }
    }

    function aroundHorizontal(node) {
      let shift = Math.floor(node / y) * 2 + 1;
      if (currIndex[0] === shift) {
        goByAmount("up", 0, 0);
      } else {
        goByAmount("down", 0, 0);
      }
    }

    function checkForArcs(node, i) {
      if (lastDirection === "up" && currIndex[1] !== 0 && currIndex[1] !== y * 2 - 1) {
        if (node[i] - node[i - 1] === y) {
          return true;
        }
      } else if (lastDirection === "down" && currIndex[1] !== 0 && currIndex[1] !== y * 2 - 1) {
        if (node[i] - node[i - 1] === -y) {
          return true;
        }
      } else if (lastDirection === "right" && currIndex[0] !== 0 && currIndex[0] !== x * 2 - 1) {
        if (node[i] - node[i - 1] === -1) {
          return true;
        }
      } else if (lastDirection === "left" && currIndex[0] !== 0 && currIndex[0] !== x * 2 - 1) {
        if (node[i] - node[i - 1] === 1) {
          return true;
        }
      }
    }

    function calcTillTheEnd(dir, index) {
      let diff;
      if (dir === "right") {
        diff = Math.abs((path[index] % y) * 2 + 1 - currIndex[1]);
      } else if (dir === "left") {
        diff = Math.abs((path[index] % y) * 2 - currIndex[1]);
      } else if (dir === "up") {
        diff = Math.abs(Math.floor(path[index] / y) * 2 - currIndex[0]);
      } else {
        diff = Math.abs(Math.floor(path[index] / y) * 2 + 1 - currIndex[0]);
      }
      let amount = diff / 2;
      if (amount === Math.floor(amount)) {
        return [amount, 1];
      } else {
        return [Math.floor(amount), 0];
      }
    }

    function goByAmount(dir, amount, subtract) {
      for (let i = 0; i < 2 * amount + 1 - subtract; i++) {
        dir === "right"
          ? (currIndex[1] += 1)
          : dir === "left"
          ? (currIndex[1] -= 1)
          : dir === "up"
          ? (currIndex[0] -= 1)
          : (currIndex[0] += 1);
        if (hamilMatrix[currIndex[0]][currIndex[1]] === 0) {
          return true;
        } else if (hamilMatrix[currIndex[0]][currIndex[1]] > 0) {
          dir === "right"
            ? (currIndex[1] -= 1)
            : dir === "left"
            ? (currIndex[1] += 1)
            : dir === "up"
            ? (currIndex[0] += 1)
            : (currIndex[0] -= 1);
          return false;
        }
        hamilMatrix[currIndex[0]][currIndex[1]] = counter;
        counter++;
        lastDirection = dir;
      }
      return false;
    }

    return hamilMatrix;
  }
}
