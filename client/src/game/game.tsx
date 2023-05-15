import React, { useEffect, useState } from "react";
import PlayerList from '../components/players-list/players-list';
import Table from '../components/table/table';
import ControlPanel from '../components/control-panel/control-panel';
import '../style.css';
import './game.css';
import { shift } from '../game/shift';
import { IActions, ICard, IDataAsk, IDataWinner, IPlayer } from "../interfaces";
import { Chat } from "../components/chat/chat";
import { Player } from "./players";
import { sounds } from "../game/sounds";
import { IMessage } from "../../../interfaces/IMessage";

type GameProps = {
  players: Array<IPlayer>;
  actions: IDataAsk;
  cards: Array<ICard>;
  player: IPlayer;
  currentPlayerIndex: number;
  bank: number;
  winInfo: IDataWinner | null;
  onGameExit: () => void;
  onBackToGame: () => void;
  isMultiPlayer: boolean;
  isClientOut: boolean;
  isWaiting: boolean;
  dealerIndex: number;
  chatMessages: IMessage[];
  playerClient: Player;
  isStarted: boolean;
  onPlaceClick: (index: number) => void;
  currentRoom: string;
  scale: number;
}

export default function Game({ players, actions, cards, player, currentPlayerIndex, bank, winInfo, onGameExit, onBackToGame, isMultiPlayer, isClientOut, isWaiting, dealerIndex, chatMessages, playerClient, isStarted, onPlaceClick, currentRoom, scale }: GameProps) {
  const _players = [...players];
  const playerIndex = _players.indexOf(player) + 3;
  const [mute, setMute] = useState(true);

  useEffect(() => {
    const handler = (enabled: boolean) => {
      setMute(!enabled);
    }
    sounds.onChange.add(handler)
    setMute(!sounds.enabled);
    return () => {
      sounds.onChange.remove(handler);
    }
  }, [])
  
  _players.map((it, index) => {
    if (it.isAbsent && it.bet) throw new Error();    
  })
  shift(_players, playerIndex);

  const [chatIsOpen, setChatIsOpen] = useState(false)

  return (
    <div className="game">
      {!isStarted && <div className="game__info-message" style={{color: 'white'}}>Wait for next game</div>}
      {isWaiting && <span className="game__info-message" style={{ color: 'white' }}>You will join on the next game</span>}
      <div className="game__buttons-wrapper">
        <button className="btn game__button game__button--exit" onClick={() => {
          onGameExit();
        }}>Exit</button>

        <button className={`btn game__button game__sound${mute ? ' game__sound-off' : ''}`} onClick={() => {
          sounds.enabled = !sounds.enabled;
        }}>Sound {!mute ? 'On' : 'Off'}</button>
      </div>

      <div className="game__room-name">
        <span>Room: {currentRoom ? currentRoom : 'Local room'}</span>
      </div>

      <div className="game__chat-wrapper">
        <p className="game__chat-toggle" onClick={() => {
          setChatIsOpen(!chatIsOpen)
        }}>{chatIsOpen ? "close chat" : "open chat"}</p>

        {chatIsOpen && (
          <Chat messages={chatMessages} onMessageCreate={(message) => {
            playerClient.sendChatMessage(message)
          }}></Chat>
        )}
      </div>
          

      <div className="game__wrapper">
        {winInfo && <div className="game__winner-message">
          <div className="game__winner-wrapper">
            <p className="game__winner-name">Winner is <span> {players[winInfo.winIndex].name}</span></p>
            <p className="game__winner-combo">Cards combination: <span>{winInfo.comboName || 'fold'}</span> </p>
            <p className="game__winner-bank">Winner bank: <span>{winInfo.count}</span></p>
          </div>
        </div>}

        <div className="game__center-container">       
          <PlayerList askId={actions?.askId} players={_players} player={isClientOut ? null : player} currentPlayer={players[currentPlayerIndex]}
            isOpened={winInfo != null} winner={players[winInfo?.winIndex]} winCards={winInfo?.cards} dealer={players[dealerIndex]}
            onClick={(index) => {
              const maxPlayers = 9;
              const cycleIndex = (maxPlayers * 2 + index + playerIndex) % maxPlayers;
              onPlaceClick(cycleIndex);
            }} />
          <Table cards={cards} players={_players.map(it => it)} winInfo = {winInfo} playerIndex = {playerIndex} bank={bank} winCards={winInfo?.cards} scale={scale}/>
        </div>
        <ControlPanel dataAsk={actions} />
      </div>
    </div>
  )
}
