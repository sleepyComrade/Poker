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

enum Round {
  Preflop = 1,
  Flop,
  Turn,
  River,
}

export function Poker() {
  const [players, setPlayers] = useState<IPlayer[]>(testPlayers);
  const [Pot, setPot] = useState(0);
  const [deck, setDeck] = useState<ICard[]>([]);
  const [tableCards, setTableCards] = useState<ICard[]>([]);
  const [dealerIndex, setDealerIndex] = useState(0);
  const initialIndex = players.length === 2 ? dealerIndex : (dealerIndex + 3) % players.length;
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(initialIndex);
  const [minimalBet, setMinimalBet] = useState(100);
  const [currentBet, setCurrentBet] = useState(minimalBet);
  const [lastInRoundIndex, setLastInRoundIndex] = useState((initialIndex - 1) % players.length >= 0 ? (initialIndex - 1) % players.length : players.length - 1);
  const [currentRound, setCurrentRound] = useState(Round.Preflop);
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

  const call = () => {
    const chipsToBet = currentBet - players[currentPlayerIndex].bet;
    players[currentPlayerIndex].bet += chipsToBet;
    players[currentPlayerIndex].chips -= chipsToBet;
    setCurrentPlayerIndex(last => (last + 1) % players.length);
    console.log('call');
  }

  const raise = () => {
    const chipsToBet = (currentBet * 2) - players[currentPlayerIndex].bet;
    players[currentPlayerIndex].bet += chipsToBet;
    players[currentPlayerIndex].chips -= chipsToBet;
    setCurrentBet(last => last * 2);
    setCurrentPlayerIndex(last => (last + 1) % players.length);
    console.log('raise');
  }

  const fold = () => {
    players[currentPlayerIndex].isFold = true;
    console.log('fold');
    if (players.filter(el => !el.isFold).length === 1) {
      console.log('Start next game');
    }
    setCurrentPlayerIndex(last => (last + 1) % players.length);
  }

  const preflop = () => {
    if (currentPlayerIndex === lastInRoundIndex && currentBet === players[currentPlayerIndex].bet) {
      return {
        raise: raise,
        check: () => console.log('Flop')
      }
    } else if (currentPlayerIndex === lastInRoundIndex && currentBet > players[currentPlayerIndex].bet) {
      return {
        fold: fold,
        call: () => {
          call();
          if (players.every(player => player.isFold || player.bet === currentBet)) {
            console.log('Flop');
          }
        },
        raise: raise
      }
    } else if (currentBet > players[currentPlayerIndex].bet) {
      return {
        fold: fold,
        call: call,
        raise: raise
      }
    } else {
      return {
        // check: 
        raise: raise
      }
    }
  }

  useEffect(() => {
    console.log(currentPlayerIndex);
    if (currentPlayerIndex !== myPlayerIndex) {
      if (!players[currentPlayerIndex].isFold) {
        setTimeout(() => {
          switch (currentRound) {
            case 1:
              const actions = preflop();
              const num = Math.floor(Math.random() * Object.keys(actions).length);
              const method = Object.keys(actions)[num] as keyof typeof actions;
              actions[method]();
              break;
            case 2:
              preflop();
              break;
            case 3:
              preflop();
              break;
            case 4:
              preflop();
              break;
            default:
              break;
          }
        }, 1000);
      } else {
        setCurrentPlayerIndex(last => (last + 1) % players.length);
      }
    } else if (players[currentPlayerIndex].isFold) {
      setCurrentPlayerIndex(last => (last + 1) % players.length);
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
      <div className="players">
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
      {(!players[myPlayerIndex].isFold && currentPlayerIndex === myPlayerIndex) && <div>
        {(currentBet > players[currentPlayerIndex].bet) && <button onClick={() => {
          // setPlayers(last => [])
          players[currentPlayerIndex].isFold = true;
          setCurrentPlayerIndex(last => (last + 1) % players.length);
        }}>Fold</button>}
        {(currentBet === players[currentPlayerIndex].bet) && <button onClick={() => {
          setCurrentPlayerIndex(last => (last + 1) % players.length);
        }}>Check</button>}
        {(!currentBet) && <button onClick={() => {

        }}>Bet</button>}
        {(currentBet > players[currentPlayerIndex].bet) && <button onClick={() => {
          call();
        }}>Call</button>}
        {(currentBet) && <button onClick={() => {

        }}>Raise</button>}
      </div>}
    </div>
  )
}