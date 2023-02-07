import React, { useEffect, useMemo, useState } from "react";
import { getCombo} from './combinations';
import { IPlayer, ICard, Round, IGameMessage, IActions } from '../interfaces';
import { getWinner } from './combo2';
import { GameLogic } from './game-logic';
import Game from '../game/game';
import { setBotChoise } from './bot-logic';
import { testPlayers, originDeck } from './players-and-deck';
import { RoomLogic } from './room-logic';
import ButtonsPanel from '../components/buttons-panel/buttons-panel';
import '../style.css';
import {SocketLogic} from "./socket-logic"
import Socket from "../components/socket";
import { Player, BotPlayer, PlayerState } from './players';

interface IProps {
  name: string;
  socket: Socket;
  currentRoom: string;
  roomLogic: RoomLogic;
  onGameExit: () => void;
}

export function Poker(props: IProps) {
  const [players, setPlayers] = useState<IPlayer[]>(testPlayers());
  const [pot, setPot] = useState(0);
  // const [deck, setDeck] = useState<ICard[]>([]);
  const [tableCards, setTableCards] = useState<ICard[]>([]);
  const [dealerIndex, setDealerIndex] = useState(0);
  const initialIndex = players.length === 2 ? dealerIndex : (dealerIndex + 3) % players.length;
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(initialIndex);
  const [winInfo, setWinInfo] = useState(null);
  const [round, setRound] = useState(0);
  const [myPlayerIndex, setMyPlayerIndex] = useState(0)
  // const [minimalBet, setMinimalBet] = useState(100);
  // const [lastInRoundIndex, setLastInRoundIndex] = useState((initialIndex - 1) % players.length >= 0 ? (initialIndex - 1) % players.length : players.length - 1);
  // const [currentRound, setCurrentRound] = useState(Round.Preflop);
  // const myPlayerIndex = 0;

  const [actions, setActions] = useState<IActions>({});

  useEffect(() => {
    // const roomLogic = new RoomLogic();
    // roomLogic.onMessage = () => {

    // }
    if (!props.socket || !props.roomLogic){
      return () => {}
    }
    // const game = new RoomLogic();
    const player = new Player('name');
    props.socket.onPokerResponse = (msg) => {
      player.handleMessage(msg);
      console.log(msg);
    }
    // const addBot = (name: string) => {
    //   const bot = new BotPlayer(name);
    //   bot.onMessage = (message: IGameMessage) => {
    //     switch (message.type) {
    //       case 'ask':
    //         setActions({});
    //         break;
    //       default:
    //         break;
    //     }
    //   };
    //   game.join(bot);
    // }
    // const game = props.roomLogic;
    const isMultiPlayer = false;
    // let playerIndex = 0;
   
    // addBot('bot1');
    // addBot('bot2');
    // const playerIndex = game.join(player);
    // setMyPlayerIndex(playerIndex);
    // addBot('bot3');
    // addBot('bot4');
    // addBot('bot5');
    // addBot('bot6');
    // setTimeout(() => {
    //   addBot('bot7');
    // }, 5000);
    // const game = isMultiPlayer ? new SocketLogic(props.socket, props.currentRoom) : new GameLogic(testPlayers(), originDeck);
    player.onMessage = (message: IGameMessage) => {
      // const message = _message.data;
      console.log(message);
      switch (message.type) {
        case 'state':
        {
          setPlayers(message.data.players);
          setPot(message.data.pot);
          setTableCards(message.data.tableCards);
          // playerIndex = message.data.players.findIndex((player: IPlayer) => player.name === props.name);
          // setCurrentPlayerIndex(message.data.currentPlayerIndex);
          break;}
        case 'ask':
        {
          const currentPlayerIndex = message.data.playerId;
          setCurrentPlayerIndex(message.data.playerId);
          console.log(currentPlayerIndex);

          // const myPlayerIndex = 0;
          const withBots = false;
          if (withBots && currentPlayerIndex !== myPlayerIndex) {
            setActions({});
            // if (!players[currentPlayerIndex].isFold) {
            // setTimeout(() => {
            //   setBotChoise(message);
            // }, 1000);
              if (!isMultiPlayer){
                // setTimeout(() => {
                //   setBotChoise(message);
                // }, 1000);
              }
            // } else {
              // setCurrentPlayerIndex(last => (last + 1) % players.length);
            // }
          } 
           else {   
            const getActions = (names: string[]) => {
              const actions: IActions = {};
              names.forEach(name => {
                actions[name as keyof IActions] = ()=> action(name)
              })
              return actions;
            }        
            
          
            const action = (name: string) => {
              props.socket.sendState({
                type: 'poker',
                roomName: props.currentRoom,
                data:{
                  type: 'move',
                  data:{
                    action: name
                  }
                }                
              })
            }
                   
            const m = {
              ...message,
                data: {...message.data,
                actions: getActions(message.data.actions)
              }              
            }
            setActions(m.data.actions);
          }
        break;}
        case 'askOther':
          {
            setCurrentPlayerIndex(message.data.playerId);
            break;
          }
        case 'winner':
          {
            setWinInfo(message.data);
            break;
          }
        case 'start': {
          // setRound(last => last + 1);
          setTableCards([]);
          setPot(0);
          setWinInfo(null);
          setPlayers(testPlayers());
          setDealerIndex(last => (last + 1) % testPlayers().length);
        }
        default:
          break;
      }
    }
    return () => {
      // game.destroy();
    }
    // setGame(game);
  }, [props.socket, props.currentRoom, props.roomLogic]);

  return (
    <div>
      <Game players={players} actions={actions} cards={tableCards} player={players[0]} 
        currentPlayerIndex={currentPlayerIndex} bank={pot} winInfo={winInfo} onGameExit={() => props.onGameExit()} />

        <button onClick={() => setWinInfo({})}>Test</button>
        <button onClick={() => {
          setRound(last => last + 1);
          setTableCards([]);
          setPot(0);
          setWinInfo(null);
          setPlayers(testPlayers());
          setDealerIndex(last => (last + 1) % testPlayers().length);
        }
          }>Restart</button>
      {/* {players.length && <Game players={players} actions={actions} cards={tableCards} player={players[myPlayerIndex]} currentPlayerIndex={currentPlayerIndex} bank={pot}/>} */}
      <button onClick={() => {
        setMyPlayerIndex(last => (last + 1) % players.length)
      }}>
hello
      </button> 
      <div>
        Current Player {currentPlayerIndex}
      </div>
      <div>
        Pot: {pot}
      </div>
      <div>
        {tableCards.map(card => {
          return (
            <div key={+`${card.type}${card.value}`}>
             {`${card.type}/${card.value}`}
            </div>
          )
        })}
      </div>
    </div>
  )
}
