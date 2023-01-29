import React, { useEffect, useState } from "react";
import { getCombo} from './combinations';
import {IPlayer, ICard} from '../interfaces';

getCombo([]);

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
  },
  {
    name: 'Player4',
    cards: [
      {
        type: 1,
        value: 1
      },
      {
        type: 2,
        value: 2
      }
    ]
  }
].map(player => ({...player, isFold: false, chips: 10000, bet: 0}));

export function Poker() {
  const [players, setPlayers] = useState<IPlayer[]>(testPlayers);
  const [Pot, setPot] = useState(0);
  const [deck, setDeck] = useState<ICard[]>([]);
  const [tableCards, setTableCards] = useState<ICard[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dealerIndex, setDealerIndex] = useState(0);
  const [minimalBet, setMinimalBet] = useState(100);
  const myPlayerIndex = 0;

  const setBlinds = (player: IPlayer, index: number, small: number, big: number) => {
    if (index === (dealerIndex + small) % players.length) {
      player.bet = minimalBet / 2;
      player.chips -= minimalBet / 2;
    }
    if (index === (dealerIndex + big) % players.length) {
      player.bet = minimalBet;
      player.chips -= minimalBet;
    }
  }

  useEffect(() => {
    console.log(currentPlayerIndex);
    if (currentPlayerIndex !== myPlayerIndex) {
      setTimeout(() => {
        setCurrentPlayerIndex(last => (last + 1) % players.length);
      }, 1000);
    }
  }, [currentPlayerIndex]);

  useEffect(() => {
    players.forEach((player, i) => {
      if (players.length > 2) {
        setBlinds(player, i, 1, 2);
      }
      if (players.length === 2) {
        setBlinds(player, i, 0, 1);
      }
    })
  }, []);

  return (
    <div>
      <div>
        Current Player {currentPlayerIndex}
      </div>
      <div>
        Pot: {Pot}
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
                {player.chips}
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
              <div>
                {player.bet > 0 && player.bet}
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
          if (currentPlayerIndex === myPlayerIndex) {
            setCurrentPlayerIndex(last => (last + 1) % players.length);
          }
        }}>Check</button>
        <button onClick={() => {

        }}>Raise</button>
      </div>
    </div>
  )
}