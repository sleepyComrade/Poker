export interface IPlayer {
    name: string;
    cards: ICard[];
    isFold: boolean;
    chips: number;
    bet: number;
  }
  
export interface ICard {
    type: number;
    value: number;
  }
  