export interface IPlayer {
  name: string;
  cards: ICard[];
  isFold: boolean;
  isAllIn: boolean;
  chips: number;
  bet: number;
}
  
export interface ICard {
  type: number;
  value: number;
}

export interface IGameMessage {
  type: string;
  data: any;
}

export enum Round {
  Preflop = 1,
  Flop,
  Turn,
  River,
}  

  export interface IActions {
    raise?: () => void;
    check?: () => void;
    fold?: () => void;
    call?: () => void;
    bet?: () => void; 
  }

  export interface IBank {
    bank: number;
    players: IPlayer[];
  }