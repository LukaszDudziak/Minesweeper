import { UI } from "./UI.js";
//klasa licznika sekund
export class Timer extends UI {
  #element = null;
  #interval = null;
  numberOfSeconds = 0;
  #maxNumberOfSeconds = 999;

  init() {
    this.#element = this.getElement(this.UiSelectors.timer);
  }
  //start timera
  startTimer() {
    this.#interval = setInterval(() => this.#updateTimer(), 1000);
  }
  stopTimer() {
    clearInterval(this.#interval);
  }
  //update czasu
  #updateTimer() {
    this.numberOfSeconds++;
    this.numberOfSeconds <= this.#maxNumberOfSeconds
      ? this.#setTimerValue(this.numberOfSeconds)
      : this.stopTimer();
  }
  //update w html
  #setTimerValue(value) {
    this.#element.textContent = value;
  }
}
