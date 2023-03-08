import React, { useEffect, useMemo, useState } from "react";
import { IPlayer, ICard, IActions, IGameMessage, IDataAsk, IDataState, IDataWinner, IDataServer, IDataAskOther } from '../interfaces';
import Game from '../game/game';
import { RoomLogic } from './room-logic';
import '../style.css';
import Socket from "../components/socket";
import { Player, BotPlayer, PlayerState } from './players';
import { sounds } from "./sounds";
import { IMessage } from "../../../interfaces/IMessage";

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
  const [tableCards, setTableCards] = useState<ICard[]>([]);
  const [dealerIndex, setDealerIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(null);
  const [winInfo, setWinInfo] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const myPlayerIndex = props.playerIndex;  
  const [actions, setActions] = useState<IDataAsk>(null);
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
    })
  }, [players1, roomState])

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
          console.warn('depricated start event');
          setWinInfo(null);
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
          props.roomLogic.handleChatMessage(message.data.message)
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
        }} onBackToGame={() => {
          props.onStateChange(false);
          setIsWaiting(true);
        }} isMultiPlayer={isMultiPlayer} isClientOut={props.isClientOut} isWaiting={isWaiting} currentRoom={props.currentRoom} />

    </div>
  )
}
