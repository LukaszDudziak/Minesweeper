import { Cell } from "./Cell.js";

class Game {
  //obiekt z danymi do generowania pola gry względem poziomu trudności #-wartość prywatna statyczna
  #config = {
    easy: {
      rows: 8,
      cols: 8,
      mines: 10,
    },
    medium: {
      rows: 16,
      cols: 16,
      mines: 40,
    },
    expert: {
      rows: 16,
      cols: 30,
      mines: 99,
    },
  };
  //initowe wartości
  #numberOfRows = null;
  #numberOfCols = null;
  #numberOfMines = null;

  //   tablica pul
  #cells = [];

  initializeGame() {
    this.#newGame();
  }
  //metoda nowej gry z defowymi wartościami
  #newGame(
    rows = this.#config.easy.rows,
    cols = this.#config.easy.cols,
    mines = this.#config.easy.mines
  ) {
    this.#numberOfRows = rows;
    this.#numberOfCols = cols;
    this.#numberOfMines = mines;

    this.#generateCells();
  }
  //generator pól
  #generateCells() {
    for (let row = 0; row < this.#numberOfRows; row++) {
      this.#cells[row] = [];
      for (let col = 0; col < this.#numberOfCols; col++) {
        this.#cells[row].push(new Cell(col, row));
      }
    }
  }
}
window.onload = function () {
  const game = new Game();
  game.initializeGame();
};
