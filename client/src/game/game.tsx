import React, { useEffect, useState } from "react";
import PlayerList from '../components/players-list/players-list';
import Table from '../components/table/table';
import ButtonsPanel from '../components/buttons-panel/buttons-panel';
import '../style.css';
import './game.css';
import { IActions, ICard, IPlayer } from "../interfaces";
import {shift} from '../game/shift';

type GameProps = {
    players: Array<IPlayer>;
    actions: IActions;
    cards: Array<ICard>;
    player: IPlayer;
    currentPlayerIndex: number;
    bank: number;
    winInfo: {winIndex: number} | null;
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
            <button className="btn game__button game__button--exit" onClick={() => {
                onGameExit();
                console.log(5);
            }}>Exit</button>
            { (!isMultiPlayer && isClientOut) && <button className="button-exit" onClick={() => {
                onBackToGame();
                console.log(6);
            }}>Back to Game</button>}
            { isWaiting && <span style={{color: 'white'}}>You will join on the next game</span>}
            <div className="game__wrapper">            
                <div className="game__center-container">
                    <PlayerList players={_players} player={player} currentPlayer={players[currentPlayerIndex]} 
                        isOpened={winInfo != null} winner={players[winInfo?.winIndex]}/>
                    <Table cards={cards} bets={_players.map(it => it.bet)} bank={bank} />
                </div>
                <ButtonsPanel actions={actions} />
            </div>
        </div>
    )
}