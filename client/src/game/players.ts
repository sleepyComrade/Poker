import { setBotChoise } from './bot-logic';
import { ICard, IGameMessage } from '../interfaces';

export class Player {
  onMessage: (message: IGameMessage) => void;
  name: string;
  constructor(name: string) {
    this.name = name;
    
  }

  handleMessage(message: IGameMessage) {
    this.onMessage(message);
  }
}

export class BotPlayer {
  name: string;
  constructor(name: string) {
    this.name = name;
    
  }

  handleMessage(message: IGameMessage) {
    setTimeout(() => {
      setBotChoise(message);
    }, 1000);
  }
}

export class PlayerState {
  name: string;
  isFold: boolean;
  isAllIn: boolean;
  chips: number;
  bet: number;
  cards: ICard[];
  constructor(name: string) {
    this.name = name;
    this.isFold = false;
    this.isAllIn = false;
    this.chips = 5000;
    this.bet = 0;
    this.cards = [];
  }
}