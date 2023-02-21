import card from "../assets/sounds/card.mp3";
import chips from "../assets/sounds/chips.mp3";
import { Signal } from "../common/signal";

class Sounds {
  private _enabled: boolean;
  onChange: Signal<boolean> = new Signal();
  constructor() {
    this._enabled = true;
  }

  private play(src: string) {
    if (!this._enabled) {
      return;
    }
    const sound = new Audio();
    sound.oncanplay = () => {
      sound.play();
    }
    sound.src = src;
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(value) {
    this._enabled = value;
    this.onChange.emit(value);
  }

  card() {
    this.play(card);
  }

  chips() {
    this.play(chips);
  }
}

export const sounds = new Sounds();