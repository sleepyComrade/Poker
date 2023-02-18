import { setBotChoise } from './bot-logic';
import { ICard, IGameMessage, IDataState, IDataAsk } from '../interfaces';
import { RoomLogic } from './room-logic';
import { createIdGenerator } from '../components/id-generator';

export class Player {
  onMessage: (message: IGameMessage<any>) => void;
  name: string;
  chips: number;
  isOut: boolean;
  static nextId: () => string = createIdGenerator("playerId") 
  roomState: IGameMessage<any>;
  id: string;
  currentRoom: RoomLogic | null = null;
  constructor(name: string) {
    this.name = name;
    this.chips = 5000;
    this.isOut = false;
    this.id = Player.nextId();
  }

  handleMessage(message: IGameMessage<any>) {
    // console.log('Player message: ', message);
    this.roomState = message;
    this.onMessage?.({...message, data: {...message.data, playerUID: this.id, roomId: this.currentRoom.name}});
  }

  getCurrentState(){
    return Promise.resolve(this.roomState);
  }

  leave() {
    this.currentRoom.leave(this);
    return Promise.resolve({});
  }

  sendChatMessage(message: string) {
    console.log("send chatMessage")
    this.onMessage?.({
      type: "chatMessage",
      data: {
        messages: [
          {
            author: this.name,
            message,
          }
        ]
      },
    })
  }
}

export class BotPlayer {
  name: string;
  onMessage: (message: IGameMessage<any>) => void;
  static nextId: () => string = createIdGenerator("botId") 
  chips: number;
  isOut: boolean;
  roomState: IGameMessage<any>;
  id: string;
  currentRoom: RoomLogic | null = null;
  constructor(name: string) {
    this.name = name;
    this.chips = 5000;
    this.isOut = false;
    this.id = BotPlayer.nextId();
  }

  handleMessage(message: IGameMessage<any>) {
    // console.log('Bot message: ', message);
    this.roomState = message;
    this.onMessage?.({...message, data: {...message.data, playerUID: this.id, roomId: this.currentRoom.name}});
    if (message.type === 'ask') {
      setTimeout(() => {
        setBotChoise(message);
      }, 1000);
    }
  }

  leave() {
    this.currentRoom.leave(this);
    return Promise.resolve({});
  }

  getCurrentState(){
    return Promise.resolve(this.roomState);
  }

  sendChatMessage(message: string) {
    this.onMessage?.({
      type: "chatMessage",
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
