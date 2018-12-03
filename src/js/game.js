import { Direction, GameControls } from "./data/data_types.js";
import { createSnake } from "./snake.js";
import { htmlRenderer } from "./renderers/renderer.js";

/**
 * Class to init onto element and run UI for snake
 */
class GameUi {
  /**
   * @param {HTMLElement} element
   * @param {GameRenderer} renderer
   */
  constructor(element, renderer) {
    this._element = element;

    this._config = {
      renderer
    };

    this._gameSpeedStart = 200;
    this._gameSpeedUpdate = 5;
    this._gameSpeedMin = 32;

    /**
     * @type {number}
     */
    this._lastPressedDirection = null;
    this._gameSpeed = this._gameSpeedStart;

    this._nextUpdateTime = -1;
    this._running = false;
    this._gameOver = false;

    this._paused = false;

    /**
     * @type {number | null}
     */
    this._frameId = null;
    this._boundDraw = this.draw.bind(this);
    this._frameStartTime = 0;

    this._snake = createSnake({
      rows: 21,
      columns: 21,
      nextFruitFn: undefined
    });

    /**
     * @type {any}
     */
    this._rendererCustomData = null;

    this.setupForRenderer();
    this.setupKeyboardControls();
    this.init();
  }

  setupForRenderer() {
    const linkElement = document.getElementById("css-link");
    const currentCssHref = linkElement.getAttribute("href");
    const newCssHref = `./css/game.${this._config.renderer.name}.css`;
    if (newCssHref !== currentCssHref) {
      linkElement.setAttribute("href", newCssHref);
    }
  }

  init() {
    const preRenderedBoard = this._snake.getBoard().map((row, yIndex) => {
      return row.map((tileValue, xIndex) => {
        return {
          position: {
            x: xIndex,
            y: yIndex
          },
          tileValue
        };
      });
    }, []);

    this._rendererCustomData = this._config.renderer.initialRender(
      preRenderedBoard,
      this._element
    );
  }

  togglePaused() {
    if (this._gameOver) {
      return;
    }

    if (!this._running) {
      this.startRunning();
    } else {
      this._paused = !this._paused;
      this._element.classList.toggle("paused", this._paused);
    }
  }

  tick() {
    if (this._lastPressedDirection) {
      this._snake.setDirection(this._lastPressedDirection);
      this._lastPressedDirection = null;
    }

    const tickReturn = this._snake.tick();
    if (!tickReturn.gameOver) {
      if (tickReturn.eating) {
        if (this._gameSpeed < this._gameSpeedMin) {
          this._gameSpeed = this._gameSpeedMin;
        } else {
          this._gameSpeed -= this._gameSpeedUpdate;
        }
      }
      this.handleAndRenderChanges(tickReturn.changes, tickReturn.eating);
    } else {
      this.handleGameOverRender();
    }
  }

  handleAndRenderChanges(changes, snakeIsEating) {
    this._config.renderer.renderChanges(
      this._rendererCustomData,
      changes,
      snakeIsEating
    );
  }

  handleGameOverRender() {
    this._gameOver = true;
    this._element.classList.add("gameover");
    this.stopRunning();
  }

  /**
   * Move the snake to a different direction
   * @param {number} direction
   */
  move(direction) {
    if (!this._paused) {
      this._lastPressedDirection = direction;
    }
  }

  /**
   * Setup keyboard controls
   */
  setupKeyboardControls() {
    window.addEventListener(
      "keydown",
      event => {
        switch (event.key) {
          case GameControls.Up:
            this.move(Direction.Up);
            break;

          case GameControls.Down:
            this.move(Direction.Down);
            break;

          case GameControls.Left:
            this.move(Direction.Left);
            break;

          case GameControls.Right:
            this.move(Direction.Right);
            break;

          case GameControls.Pause:
            this.togglePaused();
            break;
        }

        event.preventDefault();
      },
      true
    );
  }

  draw(timestamp) {
    if (!this._paused) {
      const timeDelta = timestamp - this._frameStartTime;

      if (timeDelta >= this._gameSpeed) {
        this.tick();
        this._frameStartTime = timestamp;
      }
    }

    if (this._running) {
      this._frameId = window.requestAnimationFrame(this._boundDraw);
    }
  }

  startRunning() {
    this._frameId = window.requestAnimationFrame(this._boundDraw);
    this._running = true;
  }

  stopRunning() {
    window.cancelAnimationFrame(this._frameId);
    this._running = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const renderer = htmlRenderer;

  const game = new GameUi(document.getElementById("snake-game"), renderer);
  game.startRunning();
});
