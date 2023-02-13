import { setBotChoise } from './bot-logic';
import { ICard, IGameMessage, IDataState, IDataAsk } from '../interfaces';
import { RoomLogic } from './room-logic';

export class Player {
  onMessage: (message: IGameMessage<any>) => void;
  name: string;
  chips: number;
  isOut: boolean;
  roomState: IGameMessage<any>;
  constructor(name: string) {
    this.name = name;
    this.chips = 5000;
    this.isOut = false;
  }

  handleMessage(message: IGameMessage<any>) {
    // console.log('Player message: ', message);
    this.roomState = message;
    this.onMessage?.(message);
  }

  getCurrentState(){
    return Promise.resolve(this.roomState);
  }

  sendChatMessage(room: string, message: string) {
    console.log("send chatMessage")
    this.onMessage?.({
      type: "poker",
      // @ts-ignore
      roomName: room,
      data: {
        type: "chatMessage",
        message: {
          author: this.name,
          message,
        },
      }
    })
  }
}

export class BotPlayer {
  name: string;
  onMessage: (message: IGameMessage<any>) => void;
  chips: number;
  isOut: boolean;
  roomState: IGameMessage<any>;
  constructor(name: string) {
    this.name = name;
    this.chips = 5000;
    this.isOut = false;
  }

  handleMessage(message: IGameMessage<any>) {
    // console.log('Bot message: ', message);
    this.roomState = message;
    this.onMessage?.(message);
    if (message.type === 'ask') {
      setTimeout(() => {
        setBotChoise(message);
      }, 1000);
    }
  }

  getCurrentState(){
    return Promise.resolve(this.roomState);
  }

  sendChatMessage(room: string, message: string) {
    this.onMessage?.({
      type: "chatMessage",
      // @ts-ignore
      roomName: room,
      data: {
        message: {
          author: this.name,
          message,
        },
      }
    })
  }
}

export class PlayerState {
  name: string;
  isFold: boolean;
  isAllIn: boolean;
  chips: number;
  bet: number;
  cards: ICard[];
  isAbsent: boolean;
  constructor(isFold: boolean, isAbsent: boolean, name: string, chips: number) {
    this.name = name;
    this.isFold = isFold;
    this.isAllIn = false;
    this.chips = chips;
    this.bet = 0;
    this.cards = [];
    this.isAbsent = isAbsent;
  }
}
