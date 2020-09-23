import { UI } from "./UI.js";
//klasa licznika sekund
export class Timer extends UI {
  #element = null;
  #interval = null;
  numberOfSeconds = 0;
  maxNumberOfSeconds = 999;

  init() {
    this.#element = this.getElement(this.UiSelectors.timer);
  }
  //start timera, nie użyany nigdzie na zewnątrz
  #startTimer() {
    this.#interval = setInterval(() => this.#updateTimer(), 1000);
  }
  stopTimer() {
    clearInterval(this.#interval);
  }

  //reset timera w momencie resetu gry
  resetTimer() {
    this.numberOfSeconds = 0;
    this.#setTimerValue(this.numberOfSeconds);
    this.stopTimer();
    //i odpalenie go na nowo
    this.#startTimer();
  }
  //update czasu
  #updateTimer() {
    this.numberOfSeconds++;
    this.numberOfSeconds <= this.maxNumberOfSeconds
      ? this.#setTimerValue(this.numberOfSeconds)
      : this.stopTimer();
  }
  //update w html
  #setTimerValue(value) {
    this.#element.textContent = value;
  }
}
