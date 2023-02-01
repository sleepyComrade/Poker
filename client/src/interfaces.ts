export interface IPlayer {
    name: string;
    cards: ICard[];
    isFold: boolean;
  }
  
export interface ICard {
    type: number;
    value: number;
  }
  