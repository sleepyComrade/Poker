import React, { useEffect, useState } from "react";
import PlayerList from '../components/players-list/players-list';
import Table from '../components/table/table';
import ButtonsPanel from '../components/buttons-panel/buttons-panel';
import '../style.css';
import './game.css';
import { shift } from '../game/shift';
import { IActions, ICard, IDataWinner, IPlayer } from "../interfaces";
import { IMessage } from "../interfaces/IMessage";
import { Chat } from "../components/chat/chat";
import { Player } from "./players";

type GameProps = {
  players: Array<IPlayer>;
  actions: IActions;
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
  player2: Player;
}

export default function Game({ players, actions, cards, player, currentPlayerIndex, bank, winInfo, onGameExit, onBackToGame, isMultiPlayer, isClientOut, isWaiting, dealerIndex, chatMessages, player2 }: GameProps) {
  const _players = [...players];
  const playerIndex = _players.indexOf(player) + 3;
  shift(_players, playerIndex);

  const [chatIsOpen, setChatIsOpen] = useState(false)

  return (
    <div className="game">
      <div className="game__buttons-wrapper">
        <button className="btn game__button game__button--exit" onClick={() => {
          onGameExit();
        }}>Exit</button>

        {(!isMultiPlayer && isClientOut) && <button className="btn game__button game__button--back-to-game" onClick={() => {
          onBackToGame();
        }}>Back to Game</button>}

        {isWaiting && <span className="game__info-message" style={{ color: 'white' }}>You will join on the next game</span>}
      </div>

      <div className="game__chat-wrapper">
        <p className="game__chat-toggle" onClick={() => {
          setChatIsOpen(!chatIsOpen)
        }}>{chatIsOpen ? "close chat" : "open chat"}</p>

        {chatIsOpen && (
          <Chat messages={chatMessages} onMessageCreate={(message) => {
            player2.sendChatMessage(message)
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
          <PlayerList players={_players} player={player} currentPlayer={players[currentPlayerIndex]}
            isOpened={winInfo != null} winner={players[winInfo?.winIndex]} winCards={winInfo?.cards} dealer={players[dealerIndex]} />
          <Table cards={cards} bets={_players.map(it => it.bet)} winInfo = {winInfo} playerIndex = {playerIndex} bank={bank} winCards={winInfo?.cards}/>
        </div>
        <ButtonsPanel actions={actions} />
      </div>
    </div>
  )
}