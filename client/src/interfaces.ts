export interface IPlayer {
  name: string;
  cards: ICard[];
  isFold: boolean;
  isAllIn: boolean;
  chips: number;
  bet: number;
  isAbsent: boolean;
}
  
export interface ICard {
  type: number;
  value: number;
}

export interface IDataState {
  currentPlayerIndex: number;
  currentRound: number;
  dealerIndex: number;
  deck: Array<ICard>;
  initialIndex: number;
  lastInRoundIndex: number;
  minimalBet: number;
  move: string;
  myPlayerIndex: number;
  players: Array<IPlayer>;
  pot: number;
  tableCards: Array<ICard>;
}

export interface IDataAsk {
  actions: IActions;
  playerId: number;
  raiseRange: {
    min: number,
    max: number
  };
  blind: number;
  pot: number;
  askId: number;
}

export interface IDataAskOther {
  playerId: number;
}

export interface IDataWinnerLegacy {
  winIndex: number;
  cards: ICard[];
  count: number;
  comboName: string
}
export interface IDataWinner extends IDataWinnerLegacy {
  winners: IDataWinnerLegacy[];
}

export interface IDataServer {
  actions?: Array<string>;
  playerId: number;
}

export interface IGameMessage<T> { 
  type: string;
  data: T;
}

export enum Round {
  Preflop = 1,
  Flop,
  Turn,
  River,
}  

export interface IActions {
  raise?: (count: number) => void;
  check?: () => void;
  fold?: () => void;
  call?: () => void;
  bet?: (count: number) => void; 
}

export interface IBank {
  bank: number;
  players: IPlayer[];
}
export interface IRoomState {
  roomPlayers: IPlayer[];
  gameState: {
      players: IPlayer[];
      pot: number;
      deck: ICard[];
      tableCards: ICard[];
      dealerIndex: number;
      initialIndex: number;
      currentPlayerIndex: number;
      minimalBet: number;
      lastInRoundIndex: number;
      currentRound: Round;
      myPlayerIndex: number;
  };
  isStarted: boolean;
}
