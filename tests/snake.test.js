import { Tiles } from '../src/js/data/data_types.js';

import { createSnake } from '../src/js/snake.candidate.js';

describe('Snake', () => {
  it('can make a new snake game', () => {
    const s = createSnake();
  });

  it("won't make a game below columns 5", () => {
    const factoryGameSize = size => {
      return () => {
        createSnake({
          columns: size
        });
      };
    };
    expect(factoryGameSize(4)).toThrow();
    expect(factoryGameSize(3)).toThrow();
    expect(factoryGameSize(2)).toThrow();
    expect(factoryGameSize(1)).toThrow();
    expect(factoryGameSize(0)).toThrow();
  });

  it("won't make a game below rows 5", () => {
    const factoryGameSize = size => {
      return () => {
        createSnake({
          rows: size
        });
      };
    };
    expect(factoryGameSize(4)).toThrow();
    expect(factoryGameSize(3)).toThrow();
    expect(factoryGameSize(2)).toThrow();
    expect(factoryGameSize(1)).toThrow();
    expect(factoryGameSize(0)).toThrow();
  });

  it("won't make a game with fractional sizes", () => {
    const factoryGameSize = (rows, columns) => {
      return () => {
        const snake = createSnake({
          rows,
          columns
        });
      };
    };
    expect(factoryGameSize(11.5, 11)).toThrow();
    expect(factoryGameSize(11, 11.5)).toThrow();
    expect(factoryGameSize(11.5, 11.5)).toThrow();
  });

  it('can tick a snake game', () => {
    const s = createSnake();
    s.tick();
  });

  it('can use a NextFruitFn', () => {
    const firstFruitPosition = { x: 11, y: 10 };
    const nextFruitFn = jest.fn(() => {
      return firstFruitPosition;
    });
    const s = createSnake({
      nextFruitFn
    });
    expect(nextFruitFn).toBeCalled();
    expect(s.getTile(firstFruitPosition)).toBe(Tiles.Fruit);
  });

  it('can use a NextFruitFn for several fruits', () => {
    const fruitPositions = [
      { x: 11, y: 10 },
      { x: 12, y: 10 },
      { x: 13, y: 10 },
      { x: 17, y: 10 }
    ];
    let fruitIndex = -1;
    const nextFruitFn = jest.fn(() => {
      fruitIndex += 1;
      return fruitPositions[fruitIndex];
    });
    const s = createSnake({
      nextFruitFn
    });
    s.tick();
    s.tick();
    s.tick();
    expect(nextFruitFn).toBeCalled();
    expect(s.getTile(fruitPositions[fruitIndex])).toBe(Tiles.Fruit);
  });

  it('can end up with Snake head in expected position after starting with defaults', () => {
    const s = createSnake();
    s.tick();
    s.tick();
    s.tick();
    s.tick();
    s.tick();

    const expectedPosition = {
      y: 10,
      x: 15
    };

    expect(s.getBoard()[expectedPosition.y][expectedPosition.x]).toBe(
      Tiles.Snake
    );
  });

  it('can get Snake tiles with getTile()', () => {
    const s = createSnake();
    expect(s.getTile({ x: 10, y: 10 })).toBe(Tiles.Snake);
  });
});
