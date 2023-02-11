import React, { useEffect, useState } from "react";
import PlayerList from '../components/players-list/players-list';
import Table from '../components/table/table';
import ButtonsPanel from '../components/buttons-panel/buttons-panel';
import '../style.css';
import './game.css';
import { shift } from '../game/shift';
import { IActions, ICard, IDataWinner, IPlayer } from "../interfaces";


type GameProps = {
  players: Array<IPlayer>;
  actions: IActions;
  cards: Array<ICard>;
  player: IPlayer;
  currentPlayerIndex: number;
  bank: number;
  winInfo: IDataWinner| null;
  onGameExit: () => void;
  onBackToGame: () => void;
  isMultiPlayer: boolean;
  isClientOut: boolean;
  isWaiting: boolean;
}

export default function Game({ players, actions, cards, player, currentPlayerIndex, bank, winInfo, onGameExit, onBackToGame, isMultiPlayer, isClientOut, isWaiting }: GameProps) {
  const _players = [...players];
  const playerIndex = _players.indexOf(player) + 3;
  shift(_players, playerIndex);

  return (
    <div className="game">
      <div className="game__buttons-wrapper">
        {winInfo && <div style={{backgroundColor: '#f00'}}>index: {winInfo.winIndex} cards: {winInfo.cards.map(it=> it.value + ' / ' + it.type)} combo: {winInfo.comboName || 'fold'}</div>}
        <button className="btn game__button game__button--exit" onClick={() => {
          onGameExit();
        }}>Exit</button>
        {(!isMultiPlayer && isClientOut) && <button className="button-exit" onClick={() => {
          onBackToGame();
        }}>Back to Game</button>}
        {isWaiting && <span style={{ color: 'white' }}>You will join on the next game</span>}
      </div>

      <div className="game__wrapper">
        <div className="game__center-container">
          <PlayerList players={_players} player={player} currentPlayer={players[currentPlayerIndex]}
            isOpened={winInfo != null} winner={players[winInfo?.winIndex]} />
          <Table cards={cards} bets={_players.map(it => it.bet)} bank={bank} />
        </div>
        <ButtonsPanel actions={actions} />
      </div>
    </div>
  )
}