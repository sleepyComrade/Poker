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
    console.log('call');
  }

  const raise = () => {
    const chipsToBet = (currentBet * 2) - players[currentPlayerIndex].bet;
    players[currentPlayerIndex].bet += chipsToBet;
    players[currentPlayerIndex].chips -= chipsToBet;
    setCurrentBet(last => last * 2);
    console.log('raise');
  }

  const preflop = () => {
    let isRoundEnd = false;
    if (currentPlayerIndex === lastInRoundIndex && currentBet === players[currentPlayerIndex].bet) {
      if (Math.floor(Math.random() * 2)) {
        console.log('Flop');
        isRoundEnd = true;
      } else {
        raise();
      }
    } else if (currentPlayerIndex === lastInRoundIndex && currentBet > players[currentPlayerIndex].bet) {
      // const randomChoise = Math.floor(Math.random() * 3);
      const randomChoise = 1;
      switch (randomChoise) {
        case 0:
          players[currentPlayerIndex].isFold = true;
          if (players.filter(el => !el.isFold).length === 1) {
            console.log('Start next game');
            isRoundEnd = true;
          }
          break;
        case 1:
          call();
          if (players.every(player => player.isFold || player.bet === currentBet)) {
            console.log('Flop');
            isRoundEnd = true;
          }
          break;
        case 2:
          raise();
          break;
        default:
          break;
      }
    } else if (currentBet > players[currentPlayerIndex].bet) {
      const randomChoise = Math.floor(Math.random() * 3);
      switch (randomChoise) {
        case 0:
          players[currentPlayerIndex].isFold = true;
          if (players.filter(el => !el.isFold).length === 1) {
            console.log('Start next game');
            isRoundEnd = true;
          }
          break;
        case 1:
          call();
          break;
        case 2:
          raise();
          break;
        default:
          break;
      }
    }
    if (!isRoundEnd) {
      setCurrentPlayerIndex(last => (last + 1) % players.length);
    }
  }

  useEffect(() => {
    console.log(currentPlayerIndex);
    if (currentPlayerIndex !== myPlayerIndex) {
      if (!players[currentPlayerIndex].isFold) {
        setTimeout(() => {
          // const areEqualBets = players.every(el => el.isFold || el.bet === currentBet) && players.filter(el => !el.isFold).length > 1;
          switch (currentRound) {
            case 1:
              preflop();
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

          // if (currentBet === players[currentPlayerIndex].bet) {
          //   if (currentPlayerIndex === lastInRoundIndex && areEqualBets) {
          //     if (Math.floor(Math.random() * 2)) {
          //       console.log('Flop');
          //     } else {
          //       raise();
          //     }
          //   } else {           
          //     setCurrentPlayerIndex(last => (last + 1) % players.length);
          //   }
          // }
          // if (currentBet > players[currentPlayerIndex].bet) {
          //   if (Math.floor(Math.random() * 2)) {
          //     const chipsToBet = currentBet - players[currentPlayerIndex].bet;
          //     players[currentPlayerIndex].bet += chipsToBet;
          //     players[currentPlayerIndex].chips -= chipsToBet;
          //   } else {
          //     players[currentPlayerIndex].isFold = true;
          //   }
          //   setCurrentPlayerIndex(last => (last + 1) % players.length);
          // }
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
          setCurrentPlayerIndex(last => (last + 1) % players.length);
        }}>Call</button>}
        {(currentBet) && <button onClick={() => {

        }}>Raise</button>}
      </div>}
    </div>
  )
}