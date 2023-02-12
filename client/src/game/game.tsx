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
  winInfo: IDataWinner | null;
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

  // const [isWinCard, setIsWinCard] = useState(false);

  return (
    <div className="game">
      <div className="game__buttons-wrapper">
        <button className="btn game__button game__button--exit" onClick={() => {
          onGameExit();
        }}>Exit</button>

        {(!isMultiPlayer && isClientOut) && <button className="button-exit" onClick={() => {
          onBackToGame();
        }}>Back to Game</button>}

        {isWaiting && <span style={{ color: 'white' }}>You will join on the next game</span>}
      </div>

      <div className="game__wrapper">
        {winInfo && <div className="game__winner-message">
          <div className="game__winner-wrapper">
            <p className="game__winner-name">Winner is <span>index: {winInfo.winIndex}</span></p>
            {/* <p className="game__winner-cards">winning cards: </p> {winInfo.cards.map(it => it.value + ' / ' + it.type)}          */}
            <p className="game__winner-combo">cards combination: <span>{winInfo.comboName || 'fold'}</span> </p>
            <p className="game__winner-bank">winner bank: <span>{winInfo.count}</span></p>
          </div>
        </div>}

        <div className="game__center-container">       
          <PlayerList players={_players} player={player} currentPlayer={players[currentPlayerIndex]}
            isOpened={winInfo != null} winner={players[winInfo?.winIndex]} winCards={winInfo?.cards}/>
          <Table cards={cards} bets={_players.map(it => it.bet)} bank={bank} winCards={winInfo?.cards}/>
        </div>
        <ButtonsPanel actions={actions} />
      </div>
    </div>
  )
}