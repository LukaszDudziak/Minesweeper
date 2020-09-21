import { Cell } from "./Cell.js";
import { UI } from "./UI.js";

class Game extends UI {
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

  #board = null;

  initializeGame() {
    this.#handleElements();
    this.#newGame();
  }
  //metoda nowej gry z defowymi wartościami
  #newGame(
    rows = this.#config.medium.rows,
    cols = this.#config.medium.cols,
    mines = this.#config.medium.mines
  ) {
    this.#numberOfRows = rows;
    this.#numberOfCols = cols;
    this.#numberOfMines = mines;

    this.#setStyles();

    this.#generateCells();
    this.#renderBoard();
  }
  //pobieranie elementów
  #handleElements() {
    this.#board = this.getElement(this.UiSelectors.board);
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
  #renderBoard() {
    //flat służy do utworzenia 1-wymiarowej z 2-wymiarowej
    this.#cells.flat().forEach((cell) => {
      //insertAdjecent pozwala na umieszczenie nowego elementu DOM w różnych pozycjach względem wywołanego elementu
      this.#board.insertAdjacentHTML("beforeend", cell.createElement());
      cell.element = cell.getElement(cell.selector);
    });
  }

  #setStyles() {
    document.documentElement.style.setProperty(
      "--cells-in-row",
      this.#numberOfCols
    );
  }
}

//uruchomienie gry w momencie otwarcia okna
window.onload = function () {
  const game = new Game();
  game.initializeGame();
};
