import React, { useEffect, useMemo, useState } from "react";
import { getCombo} from './combinations';
import {IPlayer, ICard} from '../interfaces';
import { getWinner } from './combo2';

getCombo([]);
console.log(getWinner([['4d', '5d'], ['6b', '7c'], ['1b', '2c']], ['2a', '2b', '5c', '2d', '3c']));

type IActions = {
  raise?: () => void;
  check?: () => void;
  fold?: () => void;
  call?: () => void;
  bet?: () => void; 
}

const originDeck: ICard[] = [];
for (let i = 1; i <= 4; i++) {
  for (let j = 1; j <= 13; j++) {
    originDeck.push({
      type: i,
      value: j
    });
  }
}

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
  }
].map(player => ({...player, isFold: false, chips: 10000, bet: 0}));

enum Round {
  Preflop = 1,
  Flop,
  Turn,
  River,
}

const shuffleCards = (deck: ICard[]) => {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
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
    setCurrentPlayerIndex(last => (last + 1) % players.length);
    console.log('raise');
  }

  const bet = () => {
    const chipsToBet = minimalBet;
    players[currentPlayerIndex].bet += chipsToBet;
    players[currentPlayerIndex].chips -= chipsToBet;
    setCurrentBet(last => last + chipsToBet);
    setCurrentPlayerIndex(last => (last + 1) % players.length);
    console.log('bet');
  }

  const fold = () => {
    players[currentPlayerIndex].isFold = true;
    if (players.filter(el => !el.isFold).length === 1) {
      console.log('Start next game');
      return;
    }
    if (currentPlayerIndex === lastInRoundIndex) {
      const getPreviousIndex = (cur: number) => (cur - 1) % players.length >= 0 ?
                                                (cur - 1) % players.length :
                                                players.length - 1;
      const getNewLastInRoundIndex = (last: number): number => players[getPreviousIndex(last)].isFold ?
                                                               getNewLastInRoundIndex(getPreviousIndex(last)) :
                                                               getPreviousIndex(last);
      setLastInRoundIndex(last => getNewLastInRoundIndex(last));
    }
    setCurrentPlayerIndex(last => (last + 1) % players.length);
    console.log('fold');
  }

  const setNextRound = () => {
    const sum = players.reduce((a, b) => a + b.bet, 0);
    setPlayers(last => last.map(player => {
      player.bet = 0;
      return player;
    }));
    setPot(last => last + sum);
    const round = currentRound;
    if (round === Round.Preflop) setCurrentRound(Round.Flop);
    if (round === Round.Flop) setCurrentRound(Round.Turn);
    if (round === Round.Turn) setCurrentRound(Round.River);
    setCurrentBet(0);
    if (round !== Round.River) {
      const initialIndex = players.length === 2 ? dealerIndex : (dealerIndex + 1) % players.length;
      setCurrentPlayerIndex(initialIndex);
      setLastInRoundIndex((initialIndex - 1) % players.length >= 0 ? (initialIndex - 1) % players.length : players.length - 1);
      if (round === Round.Preflop) {
        setTableCards(last => [...last, deck.pop(), deck.pop(), deck.pop()]);
      } else {
        setTableCards(last => [...last, deck.pop()]);
      }
    } else {
      console.log('Get Winner');
    }
  }

  const preflop = () => {
    if (currentPlayerIndex === lastInRoundIndex && currentBet === players[currentPlayerIndex].bet) {
      return {
        raise: raise,
        check: () => {
          console.log('Flop');
          setNextRound();
        }
      }
    } else if (currentPlayerIndex === lastInRoundIndex && currentBet > players[currentPlayerIndex].bet) {
      return {
        fold: fold,
        call: () => {
          call();
          if (players.every(player => player.isFold || player.bet === currentBet)) {
            console.log('Flop');
            setNextRound();
          } else {
            setCurrentPlayerIndex(last => (last + 1) % players.length);
          }
        },
        raise: raise
      }
    } else if (currentBet > players[currentPlayerIndex].bet) {
      return {
        fold: fold,
        call: () => {
          call();
          setCurrentPlayerIndex(last => (last + 1) % players.length);
        },
        raise: raise
      }
    } else {
      return {
        check: () => setCurrentPlayerIndex(last => (last + 1) % players.length),
        raise: raise
      }
    }
  }

  const flop = () => {
    if (currentPlayerIndex === lastInRoundIndex && !currentBet) {
      return {
        bet: bet,
        check: () => {
          if (currentRound === Round.Flop) console.log('Turn');
          if (currentRound === Round.Turn) console.log('River');
          setNextRound();
        }
      }
    } else if (!currentBet) {
      return {
        bet: bet,
        check: () => setCurrentPlayerIndex(last => (last + 1) % players.length),
      }
    } else if (currentPlayerIndex === lastInRoundIndex && currentBet === players[currentPlayerIndex].bet) {
      return {
        raise: raise,
        check: () => {
          if (currentRound === Round.Flop) console.log('Turn');
          if (currentRound === Round.Turn) console.log('River');
          setNextRound();
        }
      }
    } else if (currentPlayerIndex === lastInRoundIndex && currentBet > players[currentPlayerIndex].bet) {
      return {
        fold: fold,
        call: () => {
          call();
          if (players.every(player => player.isFold || player.bet === currentBet)) {
            if (currentRound === Round.Flop) console.log('Turn');
            if (currentRound === Round.Turn) console.log('River');
            setNextRound();
          } else {
            setCurrentPlayerIndex(last => (last + 1) % players.length);
          }
        },
        raise: raise
      }
    } else if (currentBet > players[currentPlayerIndex].bet) {
      return {
        fold: fold,
        call: () => {
          call();
          setCurrentPlayerIndex(last => (last + 1) % players.length);
        },
        raise: raise
      }
    } else if (currentBet === players[currentPlayerIndex].bet) {
      return {
        check: () => setCurrentPlayerIndex(last => (last + 1) % players.length),
        raise: raise
      }
    }
  }

  useEffect(() => {
    const gameDeck = [...originDeck];  
    shuffleCards(gameDeck);
    testPlayers.forEach(player => {
      player.cards.push(gameDeck.pop());
      player.cards.push(gameDeck.pop());
    })
    setDeck(gameDeck);
  }, [])

  const gameLogic = (): IActions => {
    return currentRound === Round.Preflop ? preflop() : flop();
  }

  useEffect(() => {
    const setBotChoise = () => {
      const actions = gameLogic();
      console.log(actions);
      const num = Math.floor(Math.random() * Object.keys(actions).length);
      const method = Object.keys(actions)[num] as keyof typeof actions;
      actions[method]();
    }
    console.log(currentPlayerIndex);
    if (currentPlayerIndex !== myPlayerIndex) {
      if (!players[currentPlayerIndex].isFold) {
        setTimeout(() => {
          setBotChoise();
        }, 1000);
      } else {
        setCurrentPlayerIndex(last => (last + 1) % players.length);
      }
    } else if (players[currentPlayerIndex].isFold) {
      setCurrentPlayerIndex(last => (last + 1) % players.length);
    }
  }, [currentPlayerIndex]);

  const actions = useMemo(() => gameLogic(), [currentPlayerIndex]);

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
        {/* {deck.map(card => {
          return (
            <div>
             {`${card.type}/${card.value}`}
            </div>
          )
        })} */}
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
        {actions.fold && <button onClick={() => {
          actions.fold();
        }}>Fold</button>}
        {actions.check && <button onClick={() => {
          actions.check();
        }}>Check</button>}
        {actions.bet && <button onClick={() => {
          actions.bet();
        }}>Bet</button>}
        {actions.call && <button onClick={() => {
          actions.call();
        }}>Call</button>}
        {actions.raise && <button onClick={() => {
          actions.raise();
        }}>Raise</button>}
      </div>}
    </div>
  )
}