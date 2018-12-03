import { Tiles } from "../data/data_types.js";

/**
 * @typedef {Object} Position
 * @property {number} Position.x
 * @property {number} Position.y
 */
/**
 * @typedef {Object} TileInfo
 * @property {Position} TileInfo.position
 * @property {number} TileInfo.tileValue
 */
/**
 * @typedef {Object} TickChange
 * @property {Position} TickChange.position
 * @property {number} TickChange.tileValue
 */

const TILE_SIZE = 24;

const tileClassNames = {
  [Tiles.Wall]: "wall",
  [Tiles.Snake]: "snake",
  [Tiles.Fruit]: "fruit"
};

const WallTypes = {
  TopLeft: "top-left",
  TopRight: "top-right",
  BottomLeft: "bottom-left",
  BottomRight: "bottom-right",
  Vertical: "vertical",
  Horizontal: "horizontal"
};

/**
 * Calculate size ratio
 * @param {number} value
 */
const calculateSize = value => {
  return value * TILE_SIZE;
};

/**
 * Get transform: translate() function
 * @param {Position} position
 */
const getTransform = position => {
  return `translate(${position.x * TILE_SIZE}px, ${position.y * TILE_SIZE}px)`;
};

/**
 * Create tile DOM element
 * @param {TickChange} tickChange
 * @param {number} yMax
 * @param {number} xMax
 */
const createTile = (tickChange, yMax, xMax) => {
  const { tileValue, position } = tickChange;
  const tile = document.createElement("div");
  const classNames = ["tile"];

  if (Tiles.Wall === tileValue) {
    // Checks for different Wall types e.g. horizontal, vertical or corner type
    if (position.x === 0 && position.y === 0) {
      classNames.push(WallTypes.TopLeft);
    } else if (position.x === xMax && position.y === 0) {
      classNames.push(WallTypes.TopRight);
    } else if (position.x === 0 && position.y === yMax) {
      classNames.push(WallTypes.BottomLeft);
    } else if (position.x === xMax && position.y === yMax) {
      classNames.push(WallTypes.BottomRight);
    } else if (position.y === 0 || position.y === yMax) {
      classNames.push(WallTypes.Horizontal);
    } else if (position.x === 0 || position.x === xMax) {
      classNames.push(WallTypes.Vertical);
    }
  }

  classNames.push(tileClassNames[tileValue] || "");

  tile.className = classNames.join(" ");
  tile.style.webkitTransform = getTransform(position);

  return tile;
};

export const htmlRenderer = {
  name: "html",

  /**
   * @param {TileInfo[][]} board 2D Array of TileInfo
   * @param {HTMLElement} element Element to render the board into
   * @returns {any} customData you want passed through to each renderChanges
   */
  initialRender: (board, element) => {
    const boardInnerFragment = document.createDocumentFragment();
    const rows = board.length;
    const columns = board[0].length;
    const customData = {
      snakeElements: [],
      snakePositions: [],
      fruitElement: null,
      element
    };

    element.style.height = calculateSize(rows);
    element.style.width = calculateSize(columns);

    // Iterate each tile and render visible elements
    for (let rowIndex = 0; rowIndex < rows; ++rowIndex) {
      for (let colIndex = 0; colIndex < columns; ++colIndex) {
        const tickChange = board[rowIndex][colIndex];

        if (tickChange.tileValue === Tiles.Empty) {
          continue;
        } else {
          const tile = createTile(tickChange, rows - 1, columns - 1);
          boardInnerFragment.appendChild(tile);

          if (tickChange.tileValue === Tiles.Snake) {
            customData.snakeElements.push(tile);
            customData.snakePositions.push(tickChange.position);
          } else if (tickChange.tileValue === Tiles.Fruit) {
            customData.fruitElement = tile;
          }
        }
      }
    }

    element.appendChild(boardInnerFragment);
    return customData;
  },

  /**
   * @param {any} customData custom data which was returned from initialRender
   * @param {TickChange[]} changes Changes to the board which need to be rendered
   * @param {boolean} snakeIsEating
   */
  renderChanges: (customData, changes, snakeIsEating) => {
    for (let tickChange of changes) {
      const { tileValue, position } = tickChange;

      if (tickChange.tileValue === Tiles.Empty) {
        continue;
      }

      if (snakeIsEating) {
        if (tileValue === Tiles.Snake) {
          // Grow snake
          const tile = createTile(tickChange);
          customData.snakeElements.unshift(tile);
          customData.snakePositions.unshift(position);
          customData.element.appendChild(tile);
        } else if (tileValue === Tiles.Fruit) {
          // Change position of fruit tile
          customData.fruitElement.style.webkitTransform = getTransform(
            position
          );
        }
      } else {
        // Render changes to snake body
        if (tileValue === Tiles.Snake) {
          let newPosition = position;
          const snakeSize = customData.snakeElements.length;

          for (let index = 0; index < snakeSize; ++index) {
            const snakeElement = customData.snakeElements[index];

            snakeElement.style.webkitTransform = getTransform(newPosition);

            const copy = customData.snakePositions[index];
            customData.snakePositions[index] = newPosition;
            newPosition = copy;
          }
        }
      }
    }
  }
};
