import { UI } from "./UI.js";
//klasa licznika min
export class Counter extends UI {
  value = null;
  #element = null;

  init() {
    this.#element = this.getElement(this.UiSelectors.counter);
  }
  //ustawienie wartości licznika
  setValue(value) {
    //wartość początkowa
    this.value = value;
    //przypisanie w HTML
    this.#updateValue();
  }
  //apdejty wartości countera
  increment() {
    this.value++;
    this.#updateValue();
  }
  decrement() {
    this.value--;
    this.#updateValue();
  }
  //implementacja aktualizacji w html
  #updateValue() {
    this.#element.textContent = this.value;
  }
}
