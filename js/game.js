import { Cell } from "./Cell.js";
import { UI } from "./UI.js";
import { Counter } from "./Counter.js";
import { Timer } from "./Timer.js";

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
  //utworzenie licznika min i czasu
  #counter = new Counter();
  #timer = new Timer();

  //initowe wartości
  #numberOfRows = null;
  #numberOfCols = null;
  #numberOfMines = null;

  //   tablica pul
  #cells = [];
  //do przechwytu pojedynczego elementu
  #cellsElements = null;

  #board = null;
  //inicjalizacja gry
  initializeGame() {
    this.#handleElements();
    this.#counter.init();
    this.#timer.init();
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

    //przekazanie liczby min
    this.#counter.setValue(this.#numberOfMines);
    //start timera
    this.#timer.startTimer();

    //ustawianie wejścia css (szerokość borderów, paddingów i cellsów)
    this.#setStyles();

    this.#generateCells();
    this.#renderBoard();
    //rozmieszczanie min
    this.#placeMinesInCells();

    this.#cellsElements = this.getElements(this.UiSelectors.cell);

    //wyłapywanie działania na danej komórce, zależnie od klikniętego przycisku (L/P)
    this.#addCellsEventListeners();
  }
  //pobieranie elementów
  #handleElements() {
    this.#board = this.getElement(this.UiSelectors.board);
  }
  //obsługa klików myszy
  #addCellsEventListeners() {
    this.#cellsElements.forEach((element) => {
      element.addEventListener("click", this.#handleCellClick);
      element.addEventListener("contextmenu", this.#handleCellContextMenu);
    });
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

  #placeMinesInCells() {
    let minesToPlace = this.#numberOfMines;

    while (minesToPlace) {
      //losowanie położenia miny
      const rowIndex = this.#getRandomInteger(0, this.#numberOfRows - 1);
      const colIndex = this.#getRandomInteger(0, this.#numberOfCols - 1);
      //utworzenie współrzędnych dla miny
      const cell = this.#cells[rowIndex][colIndeX];

      //sprawdzenie czy już nie ma miny
      const hasCellMine = cell.isMine;

      //plant miny jeśli nie ma jeszcze miny
      if (!hasCellMine) {
        cell.addMine();
        minesToPlace--;
      }
    }
  }

  //implementacja lewego przycisku
  #handleCellClick = (e) => {
    const target = e.target;
    //pobieranie wartości data-x data-y cella z HTML
    const rowIndex = parseInt(target.getAttribute("data-y"), 10);
    const colIndex = parseInt(target.getAttribute("data-x"), 10);
    //ustawienie konkretnej komórki i wywołanie odkrycia jej
    this.#cells[rowIndex][colIndex].revealCell();
  };

  #handleCellContextMenu = (e) => {
    //prevDef po to, żeby menu nie wyskakiwało oczywiście
    e.preventDefault();
    const target = e.target;
    //pobieranie wartości data-x data-y cella z HTML
    const rowIndex = parseInt(target.getAttribute("data-y"), 10);
    const colIndex = parseInt(target.getAttribute("data-x"), 10);
    //ustawienie konkretnej komórki i wywołanie odkrycia jej
    const cell = this.#cells[rowIndex][colIndex];
    //warunek dzięki któremu nie mogę flagować odkrytych wcześniej komórek
    if (cell.isReveal) return;

    //obsługa countera przy oflagowaniu cella
    if (cell.isFlagged) {
      this.#counter.increment();
      cell.toggleFlag();
      return;
    }
    //obsługa countera przy odflagowaniu cella
    //zamiana wartości na booleanowe false jeśli value =/= 0
    if (!!this.#counter.value) {
      this.#counter.decrement();
      //wywołanie metody na konkretnej komórce
      cell.toggleFlag();
      // return;
    }
  };

  #setStyles() {
    document.documentElement.style.setProperty(
      "--cells-in-row",
      this.#numberOfCols
    );
  }
  //metoda do losowania
  #getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

//uruchomienie gry w momencie otwarcia okna
window.onload = function () {
  const game = new Game();
  game.initializeGame();
};
