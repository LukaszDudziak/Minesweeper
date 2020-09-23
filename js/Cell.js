import { UI } from "./UI.js";

//klasa pojedynczego pola na tablicy
export class Cell extends UI {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.value = 0;
    this.isMine = false;
    this.isReveal = false;
    this.isFlagged = false;
    this.selector = `[data-x="${this.x}"][data-y="${this.y}"]`;
    this.element = null;
  }

  //metoda tworzenia poszczególnych elementów planszy
  createElement() {
    const element = `<div class="cell border border--concave" data-cell data-x="${this.x}" data-y="${this.y}"></div>`;
    return element;
  }

  //implementacja odkrywania komórek, poprzez usuwanie klasy
  revealCell() {
    this.isReveal = true;
    this.element.classList.remove("border--concave");
    this.element.classList.add("border--revealed");

    //obsługa min
    if (this.isMine) {
      this.element.classList.add("cell--is-mine");
      return;
    }

    //obsługa dodawania wartości
    if (this.value) {
      this.element.textContent = this.value;
      this.element.classList.add(`cell--info-${this.value}`);
    }
  }
  // implementacja flagowania komórki
  toggleFlag() {
    this.isFlagged = !this.isFlagged;
    this.element.classList.toggle("cell--is-flag");
  }

  addMine() {
    this.isMine = true;
  }
}
