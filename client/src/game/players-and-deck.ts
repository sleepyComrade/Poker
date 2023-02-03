import { IPlayer, ICard } from '../interfaces';

export const originDeck: ICard[] = [];
for (let i = 1; i <= 4; i++) {
  for (let j = 1; j <= 13; j++) {
    originDeck.push({
      type: i,
      value: j
    });
  }
}

export const testPlayers = () => {
  const testPlayers: IPlayer[] = [
    {
      name: 'Player1',
      cards: []
    },
    {
      name: 'Player2',
      cards: []
    },
    {
      name: 'Player3',
      cards: []
    },
    {
      name: 'Player4',
      cards: []
    },
    {
      name: 'Player5',
      cards: []
    },
    {
      name: 'Player6',
      cards: []
    },
    {
      name: 'Player7',
      cards: []
    },
    {
      name: 'Player8',
      cards: []
    },
    {
      name: 'Player9',
      cards: []
    }
  ].map(player => ({...player, isFold: false, isAllIn: false, chips: 5000, bet: 0}));
  return testPlayers;
}