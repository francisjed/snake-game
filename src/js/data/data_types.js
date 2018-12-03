/*
  Some constants which are imported and used between modules.
*/

/**
 * Enum for Tiles
 * @readonly
 * @enum {number}
 */
export const Tiles = {
  Empty: 0,
  Wall: 1,
  Snake: 2,
  Fruit: 3
};

/**
 * Enum for Directions
 * @readonly
 * @enum {number}
 */
export const Direction = {
  Up: 1,
  Left: 2,
  Down: 3,
  Right: 4
};

/**
 * Enum for Movements
 * @readonly
 * @enum {number}
 */
export const Movement = {
  Vertical: 0,
  Horizontal: 1
}

/**
 * Enum for GameControls
 * @readonly
 * @enum {string}
 */
export const GameControls = {
  Up: 'ArrowUp',
  Left: 'ArrowLeft',
  Right: 'ArrowRight',
  Down: 'ArrowDown',
  Pause: ' '
}
