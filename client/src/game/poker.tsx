import React, { useState } from "react";
interface IPlayer {
  name: string;
  cards: ICard[];
  isFold: boolean;
}

interface ICard {
  type: number;
  value: number;
}

const testPlayers: IPlayer[] = [
  {
    name: 'Player1',
    cards: [
      {
        type: 0,
        value: 4
      },
      {
        type: 3,
        value: 5
      }
    ]
  },
  {
    name: 'Player2',
    cards: [
      {
        type: 1,
        value: 4
      },
      {
        type: 2,
        value: 5
      }
    ]
  },
  {
    name: 'Player3',
    cards: [
      {
        type: 1,
        value: 7
      },
      {
        type: 3,
        value: 9
      }
    ]
  }
].map(player => ({...player, isFold: false}));

export function Poker() {
  const [players, setPlayers] = useState<IPlayer[]>(testPlayers);
  const [totalBet, setTotalBet] = useState(0);
  const [deck, setDeck] = useState<ICard[]>([]);
  const [tableCards, setTableCards] = useState<ICard[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  return (
    <div>
      <div>
        Current Player {currentPlayerIndex}
      </div>
      <div>
        Total Bet {totalBet}
      </div>
      <div>
        {deck.map(card => {
          return (
            <div>
             {`${card.type}/${card.value}`}
            </div>
          )
        })}
      </div>
      <div>
        {tableCards.map(card => {
          return (
            <div>
             {`${card.type}/${card.value}`}
            </div>
          )
        })}
      </div>
      <div>
        {players.map(player => {
          return (
            <div>
              <div>
                {player.name}
                {player.isFold ? 'Player is out' : ''}
              </div>
              <div>
                {player.cards.map(card => {
                  return (
                    <div>
                     {`${card.type}/${card.value}`}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div>
        <button onClick={() => {
          // setPlayers(last => [])
        }}>Fold</button>
        <button onClick={() => {
          setCurrentPlayerIndex(last => (last + 1) % players.length);
        }}>Check</button>
        <button onClick={() => {

        }}>Raise</button>
      </div>
    </div>
  )
}