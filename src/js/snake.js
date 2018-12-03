import { Tiles, Direction, Movement } from "./data/data_types.js";

/**
 *  JSDoc
 */
/**
 * @typedef {Object} Position
 * @property {number} Position.x
 * @property {number} Position.y
 */
/**
 * @typedef {Object} SnakeConfigParams
 * @property {number} SnakeConfigParams.rows
 * @property {number} SnakeConfigParams.columns
 * @property {NextFruitFn=} SnakeConfigParams.nextFruitFn
 */
/**
 * @typedef {Object} Snake
 * @property {(number) => void} Snake.setDirection
 * @property {(Position) => number} Snake.getTile
 * @property {() => TickReturn} Snake.tick
 * @property {() => number[][]} Snake.getBoard
 */
/**
 * @typedef {Object} TickChange
 * @property {Position} TickChange.position
 * @property {number} TickChange.tileValue
 */
/**
 * @typedef {Object} TickReturn
 * @property {boolean} TickReturn.gameOver if the game is over, or already was if tick keeps being called.
 * @property {boolean} TickReturn.eating if a fruit was eaten this tick
 * @property {TickChange[]} TickReturn.changes a list of changes which can be used to render changes
 */
/**
 * @typedef {() => Position} NextFruitFn function which will return next fruit Position
 */

/**
 * @param {SnakeConfigParams} config
 * @returns {Snake}
 */
export const createSnake = config => {
  return new Snake(config);
};

const getRandomNumberFromRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * @type {Snake}
 */
class Snake {
  /**
   * @param {SnakeConfigParams} config
   */
  constructor(config) {
    this._config = Object.assign({}, config);

    // Ensures that rows and columns have default value of 21 if not defined.
    const { rows = 21, columns = 21 } = this._config;
    this._config.rows = rows;
    this._config.columns = columns;

    if (rows < 5 || columns < 5) {
      throw new Error(
        "Sizes for rows and columns must be equal or greater than 5."
      );
    }

    if (rows % 1 !== 0 || columns % 1 !== 0) {
      throw new Error("Fractional sizes for rows and columns is not allowed.");
    }

    this._board = this.createBoard();
    const snakePosition = this.getInitialPosition();
    this._snake = [snakePosition];
    this._fruit = this.nextFruit();
    this._direction = Direction.Right;
  }

  /**
   * Creates board with Tiles.Wall and Tiles.Empty
   *
   * @returns {number[][]} 2D Array of Tiles
   */
  createBoard() {
    const { rows, columns } = this._config;
    let board = new Array(rows);
    board = board.fill(new Array(columns));
    board = board.map((row, index) => {
      if (index === 0 || index === rows - 1) {
        return row.slice().fill(Tiles.Wall);
      }

      row = row.slice().fill(Tiles.Empty);
      row[0] = Tiles.Wall;
      row[columns - 1] = Tiles.Wall;
      return row;
    });

    return board;
  }

  /**
   * Get initial position of the snake
   *
   * @returns {Position}
   */
  getInitialPosition() {
    const { rows, columns } = this._config;

    const y = Math.round((rows - 1) / 2);
    const x = Math.round((columns - 1) / 2);

    return { x, y };
  }

  /**
   * Get the 2D board
   *
   * @returns {number[][]} 2D Array of Tiles
   */
  getBoard() {
    // copy the board
    const copy = this._board.map(row => row.slice());

    if (this._fruit) {
      copy[this._fruit.y][this._fruit.x] = Tiles.Fruit;
    }

    // copy our snake onto board
    this._snake.forEach(s => {
      copy[s.y][s.x] = Tiles.Snake;
    });

    return copy;
  }

  /**
   * Get the tile value (number) at Position {x, y}
   * @param {Position} position Tiles value for this position
   *
   * @returns {number}
   */
  getTile(position) {
    const { rows, columns } = this._config;
    const { x, y } = position;

    // This ensures that out of bounds will return a wall.
    if (x < 0 || x > columns - 1 || y < 0 || y > rows - 1) {
      return Tiles.Wall;
    }

    return this.getBoard()[y][x];
  }

  /**
   * Set current movement direction.
   *
   * @param {number} direction Direction value for this position
   */
  setDirection(direction) {
    const currentMovement = this.getMovement(this._direction);
    const incomingMovement = this.getMovement(direction);

    // Only set if snake is moving in a different direction
    if (currentMovement !== incomingMovement) {
      this._direction = direction;
    }
  }

  /**
   * Get the snakes movement based on direction
   *
   * @param {number} direction
   * @returns {number}
   */
  getMovement(direction) {
    const vertical = [Direction.Up, Direction.Down];

    if (vertical.indexOf(direction) > -1) {
      return Movement.Vertical;
    }

    return Movement.Horizontal;
  }

  /**
   * Checks if snake is eating a fruit based on its position
   *
   * @param {Position} position
   * @returns {boolean}
   */
  isEating(position) {
    const tile = this.getTile(position);
    return tile === Tiles.Fruit;
  }

  /**
   * Checks for collision with the wall or the snakes body.
   *
   * @param {Position} position
   * @returns {boolean}
   */
  isGameOver(position) {
    const tile = this.getTile(position);

    return tile === Tiles.Wall || tile === Tiles.Snake;
  }

  /**
   * Move snake's body
   *
   * @param {Position} headPosition
   * @returns {TickChange[]}
   */
  moveSnake(headPosition) {
    const snakeCopy = this._snake.slice();
    const tailPosition = snakeCopy.pop();
    snakeCopy.unshift(headPosition);
    this._snake = snakeCopy;

    return [
      {
        position: tailPosition,
        tileValue: Tiles.Empty
      },
      {
        position: headPosition,
        tileValue: Tiles.Snake
      }
    ];
  }

  /**
   * Grow snake's body by 1 tile
   *
   * @param {Position} headPosition
   * @returns {TickChange[]}
   */
  growSnake(headPosition) {
    const fruitPosition = this.nextFruit();
    this._fruit = fruitPosition;
    const snakeCopy = this._snake.slice();
    snakeCopy.unshift(headPosition);
    this._snake = snakeCopy;

    return [
      {
        position: fruitPosition,
        tileValue: Tiles.Fruit
      },
      {
        position: headPosition,
        tileValue: Tiles.Snake
      }
    ];
  }

  /**
   * Gets the next fruit
   * @returns {Position}
   */
  nextFruit() {
    let { nextFruitFn } = this._config;

    if (typeof nextFruitFn === "undefined") {
      nextFruitFn = () => {
        const { rows, columns } = this._config;
        const x = getRandomNumberFromRange(1, columns - 2);
        const y = getRandomNumberFromRange(1, rows - 2);

        return { x, y };
      };
    }

    let fruitPosition = nextFruitFn();
    let tile = this.getTile(fruitPosition);

    while (tile === Tiles.Snake) {
      fruitPosition = nextFruitFn();
      tile = this.getTile(fruitPosition);
    }

    return fruitPosition;
  }

  /**
   * Progress the snake forward one spot and return the result.
   * @returns {TickReturn}
   */
  tick() {
    let { x, y } = this._snake[0];

    if (this._direction === Direction.Up) {
      y -= 1;
    } else if (this._direction === Direction.Down) {
      y += 1;
    } else if (this._direction === Direction.Left) {
      x -= 1;
    } else if (this._direction === Direction.Right) {
      x += 1;
    }

    const headPosition = { x, y };
    const isEating = this.isEating(headPosition);
    const isGameOver = this.isGameOver(headPosition);
    const tickReturn = {
      gameOver: isGameOver,
      eating: isEating,
      changes: []
    };

    if (isGameOver) {
      return tickReturn;
    } else if (isEating) {
      tickReturn.changes = this.growSnake(headPosition);
    } else {
      tickReturn.changes = this.moveSnake(headPosition);
    }

    return tickReturn;
  }
}
