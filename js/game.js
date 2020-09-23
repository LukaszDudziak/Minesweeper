import { Cell } from "./Cell.js";
import { UI } from "./UI.js";
import { Counter } from "./Counter.js";
import { Timer } from "./Timer.js";
import { ResetButton } from "./ResetButton.js";
import { Modal } from "./Modal.js";

class Game extends UI {
  //obiekt z danymi do generowania pola gry względem poziomu trudności #-wartość prywatna statyczna
  #config = {
    easy: {
      rows: 8,
      cols: 8,
      mines: 10,
    },
    normal: {
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
  #modal = new Modal();

  //initowe wartości
  #isGameFinished = false;
  #numberOfRows = null;
  #numberOfCols = null;
  #numberOfMines = null;

  //   tablica pul
  #cells = [];
  //do przechwytu pojedynczego elementu
  #cellsElements = null;

  //do obsługi wygranej
  #cellsToReveal = 0;
  #revealedCells = 0;

  #board = null;
  #buttons = {
    modal: null,
    easy: null,
    normal: null,
    expert: null,
    reset: new ResetButton(),
  };
  //inicjalizacja gry
  initializeGame() {
    this.#handleElements();
    this.#counter.init();
    this.#timer.init();
    this.#addButtonsEventListeners();
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
    this.#timer.resetTimer();

    //ile komórek trzeba odkryć do wygranej
    this.#cellsToReveal =
      this.#numberOfCols * this.#numberOfRows - this.#numberOfMines;

    this.#buttons.reset.changeEmotion("neutral");

    this.#isGameFinished = false;
    this.#revealedCells = 0;

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
  //obsłga końca gry
  #endGame(isWin) {
    this.#isGameFinished = true;
    this.#timer.stopTimer();
    this.#modal.buttonText = "Close";

    //w wypadku przegranej
    if (!isWin) {
      this.#revealMines();
      this.#modal.infoText = "You lost, try again";
      this.#buttons.reset.changeEmotion("negative");
      this.#modal.setText();
      this.#modal.toggleModal();
      return;
    }
    this.#modal.infoText =
      this.#timer.numberOfSeconds < this.#timer.maxNumberOfSeconds
        ? `You won, it took you ${
            this.#timer.numberOfSeconds
          } seconds, congratulations!`
        : `You won! `;
    this.#buttons.reset.changeEmotion("positive");
    this.#modal.setText();
    this.#modal.toggleModal();
  }

  //pobieranie elementów
  #handleElements() {
    this.#board = this.getElement(this.UiSelectors.board);
    //!!!!!!!!!!!!!!!!!!!!
    this.#buttons.modal = this.getElement(this.UiSelectors.modalButton);
    this.#buttons.easy = this.getElement(this.UiSelectors.easyButton);
    this.#buttons.normal = this.getElement(this.UiSelectors.normalButton);
    this.#buttons.expert = this.getElement(this.UiSelectors.expertButton);
  }
  //obsługa klików myszy na komórki
  #addCellsEventListeners() {
    this.#cellsElements.forEach((element) => {
      element.addEventListener("click", this.#handleCellClick);
      element.addEventListener("contextmenu", this.#handleCellContextMenu);
    });
  }

  //usuwanie listenerów w momencie resetowania gry
  #removeCellsEventListeners() {
    this.#cellsElements.forEach((element) => {
      element.removeEventListener("click", this.#handleCellClick);
      element.removeEventListener("contextmenu", this.#handleCellContextMenu);
    });
  }

  //obsługa przycisków resetu i poziomu trudności
  #addButtonsEventListeners() {
    //obsługa przycisku modala
    this.#buttons.modal.addEventListener("click", this.#modal.toggleModal);

    this.#buttons.easy.addEventListener("click", () =>
      this.#handleNewGameClick(
        this.#config.easy.rows,
        this.#config.easy.cols,
        this.#config.easy.mines
      )
    );
    this.#buttons.normal.addEventListener("click", () =>
      this.#handleNewGameClick(
        this.#config.normal.rows,
        this.#config.normal.cols,
        this.#config.normal.mines
      )
    );
    this.#buttons.expert.addEventListener("click", () =>
      this.#handleNewGameClick(
        this.#config.expert.rows,
        this.#config.expert.cols,
        this.#config.expert.mines
      )
    );
    this.#buttons.reset.element.addEventListener("click", () =>
      this.#handleNewGameClick()
    );
  }

  //tworzenie nowej gry
  #handleNewGameClick(
    rows = this.#numberOfRows,
    cols = this.#numberOfCols,
    mines = this.#numberOfMines
  ) {
    //restart na wejście
    this.#removeCellsEventListeners();
    //start gry
    this.#newGame(rows, cols, mines);
  }

  //generator pól
  #generateCells() {
    //czyszczenie tablicy w momencie użycia buttonów
    this.#cells.length = 0;
    //generowanie pól gry
    for (let row = 0; row < this.#numberOfRows; row++) {
      this.#cells[row] = [];
      for (let col = 0; col < this.#numberOfCols; col++) {
        this.#cells[row].push(new Cell(col, row));
      }
    }
  }
  #renderBoard() {
    //czyszczenie tablicy w momencie, gdy używamy buttona i już jakaś tablica istnieje
    while (this.#board.firstChild) {
      this.#board.removeChild(this.#board.lastChild);
    }
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
      const cell = this.#cells[rowIndex][colIndex];

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
    //2. przypisanie do zmiennej która dalej będzie użyta do sprawdzania czy w komórce jest mina
    const cell = this.#cells[rowIndex][colIndex]; //.revealCell();
    this.#clickCell(cell);
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
    if (cell.isReveal || this.#isGameFinished) return;

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

  //sprawdzanie czy dana komórka jest miną, jeśli nie to
  #clickCell(cell) {
    //sprawdzenie czy gra nie jest skończona/komórka oflagowana
    if (this.#isGameFinished || cell.isFlagged) return;
    //sprawdzenie czy nie jest miną
    if (cell.isMine) {
      this.#endGame(false);
    }
    // ustawienie wartości w komórce
    this.setCellValue(cell);

    //warunek wygranej
    if (this.#revealedCells === this.#cellsToReveal && !this.#isGameFinished) {
      this.#endGame(true);
    }
  }

  #revealMines() {
    //wyfiltrowanie tych komórek, które są minami za pomocą wyrażenia destrukturyzującego
    this.#cells
      .flat()
      .filter(({ isMine }) => isMine)
      .forEach((cell) => cell.revealCell());
  }
  //implementacja zliczania min dookoła pola
  setCellValue(cell) {
    let minesCount = 0;
    //math.max i min użyty, żeby sprawdzić graniczne wartości, jako że narożniki i komórki przy ścianach nie mają "pełnych sąsiadów"
    for (
      let rowIndex = Math.max(cell.y - 1, 0);
      rowIndex <= Math.min(cell.y + 1, this.#numberOfRows - 1);
      rowIndex++
    ) {
      for (
        let colIndex = Math.max(cell.x - 1, 0);
        colIndex <= Math.min(cell.x + 1, this.#numberOfCols - 1);
        colIndex++
      ) {
        if (this.#cells[rowIndex][colIndex].isMine) {
          minesCount++;
        }
      }
    }
    cell.value = minesCount;
    cell.revealCell();
    this.#revealedCells++;

    //obsługa odkrywania pól, które nie mają żadnej wartości i wartości pól sąsiadujących z nimi
    if (!cell.value) {
      for (
        let rowIndex = Math.max(cell.y - 1, 0);
        rowIndex <= Math.min(cell.y + 1, this.#numberOfRows - 1);
        rowIndex++
      ) {
        for (
          let colIndex = Math.max(cell.x - 1, 0);
          colIndex <= Math.min(cell.x + 1, this.#numberOfCols - 1);
          colIndex++
        ) {
          const cell = this.#cells[rowIndex][colIndex];
          if (!cell.isReveal) {
            //poprzez autoclick
            this.#clickCell(cell);
          }
        }
      }
    }
  }

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
