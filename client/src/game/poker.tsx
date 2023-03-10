import React, { useEffect, useMemo, useState } from "react";
import { IPlayer, ICard, IActions, IGameMessage, IDataAsk, IDataState, IDataWinner, IDataServer, IDataAskOther } from '../interfaces';
import Game from '../game/game';
import { testPlayers } from './players-and-deck';
import { RoomLogic } from './room-logic';
import '../style.css';
import Socket from "../components/socket";
import { Player, BotPlayer, PlayerState } from './players';
import { PlayerClient } from "./player-client";
import { IMessage } from "../interfaces/IMessage";
import { sounds } from "./sounds";

interface IProps {
  name: string;
  socket: Socket;
  currentRoom: string;
  roomLogic: RoomLogic;
  onGameExit: () => void;
  playerIndex: number;
  player: Player;
  onPlaceClick: (index: number) => void;
  isClientOut:boolean;
  onStateChange: (bool: boolean) => void;
}

export function Poker(props: IProps) {
  const [players1, setPlayers] = useState<IPlayer[]>(new Array(9).fill(null).map(it => new PlayerState(true, true, 'NULL', 0)));
  const [pot, setPot] = useState(0);
  // const [deck, setDeck] = useState<ICard[]>([]);
  const [tableCards, setTableCards] = useState<ICard[]>([]);
  const [dealerIndex, setDealerIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(null);
  const [winInfo, setWinInfo] = useState(null);
  const [round, setRound] = useState(0);
  const [roomState, setRoomState] = useState(null);
  const myPlayerIndex = props.playerIndex;
  // const [myPlayerIndex, setMyPlayerIndex] = useState(props.playerIndex)
  // const [lastInRoundIndex, setLastInRoundIndex] = useState((initialIndex - 1) % players.length >= 0 ? (initialIndex - 1) % players.length : players.length - 1);
  // const [currentRound, setCurrentRound] = useState(Round.Preflop);
  // const myPlayerIndex = 0;

  const [actions, setActions] = useState<IDataAsk>(null);
  // const [clientPlayer, setClientPlayer] = useState<Player | null>(null);
  // const [isMultiPlayer, setIsMultiplayer] = useState(props.currentRoom !== "");
  const [isWaiting, setIsWaiting] = useState(false);

  const [chatMessages, setChatMessages] = useState<IMessage[]>([])
  const isMultiPlayer = props.currentRoom !== "";

  const players = useMemo(() => {
    console.log(roomState)
    return players1.map((it, i) => {
      if (it.isAbsent == true) {
        return (roomState && (roomState.roomPlayers[i] && new PlayerState(true, true, roomState.roomPlayers[i].name, roomState.roomPlayers[i].chips))) || it;
      } else {
        return it
      }
      //return it || (roomState && (roomState.roomPlayers[i] && new PlayerState(false, true, roomState.roomPlayers[i].name, roomState.roomPlayers[i].chips)));
    })
  }, [players1, roomState])

  // useEffect(() => {
  //   props.socket.onMessage = (messages) => {
  //     console.log("CHAT MESSAGE", messages)
  //     setChatMessages(messages)
  //   }
  // })

  useEffect(() => {
    if (!props.currentRoom) {
      return
    }
    props.socket.sendState({
      type: "poker",
      roomName: props.currentRoom,
      data: {
        type: "getChatHistory",
      }
    }).then(res => {
        setChatMessages(res.messages)     
      })
  }, [])

  useEffect(() => {
    if (!props.player) {
      return () => { }
    }

    // props.player.setChatMessage()

    // const player = isMultiPlayer ? new PlayerClient('name', props.socket, props.currentRoom) : new Player('name');
    // setClientPlayer(player);
    props.player.onMessage = (message: IGameMessage<any>) => {
      console.log(message);
      switch (message.type) {
        case 'roomState': {
          if (!message.data.isStarted) {
            console.log('Wait for players!!');
          }
          setRoomState(message.data);
          if (message.data.gameState) {
            if (message.data.gameState.tableCards) {
              console.log('!!!!!!!!!!!!!!', message.data.gameState.tableCards);
            }
            setTableCards(message.data.gameState.tableCards);
            setPlayers(message.data.gameState.players);
            setPot(message.data.gameState.pot);
          }
          break;
        }
        case 'state':
          {
            const data: IDataState = message.data;
            setPlayers(data.players);
            setPot(data.pot);
            // if (data.tableCards > tableCards) {
            //   sounds.card();
            // }
            setTableCards(data.tableCards);
            if (data.move == 'start') {
              setWinInfo(null);
              setTableCards([]);
              setPot(0);
            }
            setDealerIndex(data.dealerIndex);
            // playerIndex = message.data.players.findIndex((player: IPlayer) => player.name === props.name);
            // setCurrentPlayerIndex(message.data.currentPlayerIndex);
            break;
          }
        case 'ask':
          {
            const data: IDataAsk = message.data;
            const currentPlayerIndex = data.playerId;
            setCurrentPlayerIndex(data.playerId);
            setActions(data);
            break;
          }
        case 'askOther':
          {
            const data: IDataAskOther = message.data;
            setCurrentPlayerIndex(data.playerId);
            setActions(null);
            break;
          }
        case 'winner':
          {
            const data: IDataWinner = message.data;
            setWinInfo(data);
            setActions(null);
            break;
          }
        case 'start': {
          // setRound(last => last + 1);
          //setTableCards([]);
          //setPot(0);
          setWinInfo(null);
          setPlayers(testPlayers());
          setDealerIndex(last => (last + 1) % testPlayers().length);
          break;
        }
        case 'leave': {
          setActions(null);
          props.onStateChange(true);
          break;
        }
        case 'join': {
          // setActions({});
          // setPlayers(message.data.players);
          break;
        }
        case 'get back': {
          setIsWaiting(false);
          break;
        }
        case 'wait': {
          setIsWaiting(true);
          break;
        }
        case "chatMessage": {
          // console.log("ChatMessage")
          props.roomLogic.handleChatMessage(message.data.message)
          // setChatMessages(message.data.messages)
          break
        }
        case "chatMessages": {
          setChatMessages(message.data.messages)
        }
        default:
          break;
      }
    }

    props.player.getCurrentState?.().then(res => {
      setRoomState(res?.data);
      if (res && res.data.gameSate) {
        if (res.data.gameState.tableCards) {
        }
        setTableCards(res.data.gameState.tableCards);
        setPot(res.data.pot);
      }
    })

    return () => {

    }
  }, [props.player]);

  return (
    <div>
      <Game isStarted={roomState?.isStarted || false} players={players} actions={actions} cards={tableCards} player={players[myPlayerIndex]} dealerIndex={dealerIndex}
        currentPlayerIndex={currentPlayerIndex} bank={pot} winInfo={winInfo} chatMessages={chatMessages} playerClient={props.player}
        onPlaceClick={(index) => {
          console.log('place index:', index);
          props.onPlaceClick(index);
        }}
        onGameExit={() => {
          props.onGameExit();
          // props.roomLogic.leave(clientPlayer);
        }} onBackToGame={() => {
          props.onStateChange(false);
          setIsWaiting(true);
          // props.roomLogic.backToGame(clientPlayer);
        }} isMultiPlayer={isMultiPlayer} isClientOut={props.isClientOut} isWaiting={isWaiting} currentRoom={props.currentRoom} />

      <div style={{ 'display': 'none' }}>
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
        <button onClick={() => {
          // setMyPlayerIndex(last => (last + 1) % players.length)
        }}>hello</button>
        <div>Pot: {pot}</div>
      </div>

    </div>
  )
}
