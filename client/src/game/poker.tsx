import React, { useEffect, useMemo, useState } from "react";
import { getCombo} from './combinations';
import { IPlayer, ICard, Round, IGameMessage, IActions } from '../interfaces';
import { getWinner } from './combo2';
import { GameLogic } from './game-logic';
import Game from '../game/game';
import { setBotChoise } from './bot-logic';
import ButtonsPanel from '../components/buttons-panel/buttons-panel';
import '../style.css';

const originDeck: ICard[] = [];
for (let i = 1; i <= 4; i++) {
  for (let j = 1; j <= 13; j++) {
    originDeck.push({
      type: i,
      value: j
    });
  }
}

const testPlayers = () => {
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


export function Poker() {
  const [players, setPlayers] = useState<IPlayer[]>(testPlayers);
  const [pot, setPot] = useState(0);
  // const [deck, setDeck] = useState<ICard[]>([]);
  const [tableCards, setTableCards] = useState<ICard[]>([]);
  const [dealerIndex, setDealerIndex] = useState(0);
  const initialIndex = players.length === 2 ? dealerIndex : (dealerIndex + 3) % players.length;
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(initialIndex);
  const [winInfo, setWinInfo] = useState(null);
  const [round, setRound] = useState(0);
  // const [minimalBet, setMinimalBet] = useState(100);
  // const [lastInRoundIndex, setLastInRoundIndex] = useState((initialIndex - 1) % players.length >= 0 ? (initialIndex - 1) % players.length : players.length - 1);
  // const [currentRound, setCurrentRound] = useState(Round.Preflop);
  const myPlayerIndex = 0;

  const [actions, setActions] = useState<IActions>({});

  useEffect(() => {
    const game = new GameLogic(testPlayers(), originDeck);
    game.onMessage = (message: IGameMessage) => {
      console.log(message);
      switch (message.type) {
        case 'state':
        {  
          setPlayers(message.data.players);
          setPot(message.data.pot);
          setTableCards(message.data.tableCards);
          // setCurrentPlayerIndex(message.data.currentPlayerIndex);
          break;}
        case 'ask':
        {
          const currentPlayerIndex = message.data.playerId;
          setCurrentPlayerIndex(message.data.playerId);
          console.log(currentPlayerIndex);
          // const myPlayerIndex = 0;
          const withBots = true;
          if (withBots && currentPlayerIndex !== myPlayerIndex) {
            setActions({});
            // if (!players[currentPlayerIndex].isFold) {
            setTimeout(() => {
              setBotChoise(message);
            }, 1000);
          } 
           else {
            setActions(message.data.actions);
          }
        break;}
        case 'winner':
          {
            setWinInfo(message.data);

            break;
          }
        default:
          break;
      }
    }
    return () => {
      game.destroy();
    }
  }, [round])

  return (
    <div>
      <Game players={players} actions={actions} cards={tableCards} player={players[myPlayerIndex]} currentPlayerIndex={currentPlayerIndex} bank={pot} 
        winInfo={winInfo} />
        <button onClick={() => setWinInfo({})}>Test</button>
        <button onClick={() => {
          setRound(last => last + 1);
          setTableCards([]);
          setPot(0);
          setWinInfo(null);
          setPlayers(testPlayers);
          setDealerIndex(last => (last + 1) % testPlayers.length);
        }
          }>Restart</button>
      <div>
        Current Player {currentPlayerIndex}
      </div>
      <div>
        Pot: {pot}
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
    </div>
  )
}