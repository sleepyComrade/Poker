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
}

export default function Game({ players, actions, cards, player, currentPlayerIndex, bank }: GameProps) {
    const _players = [...players];
    const playerIndex = _players.indexOf(player) + 3;
    shift(_players, playerIndex);

    return (
        <div className="game">
            <div className="game__wrapper">
                <div className="game__center-container">
                    <PlayerList players={_players} player={player} currentPlayer={players[currentPlayerIndex]}/>
                    <Table cards={cards} bets={_players.map(it => it.bet)} bank={bank} />
                </div>
                {/* {(!players[myPlayerIndex].isFold && currentPlayerIndex === myPlayerIndex) &&  */}
                <ButtonsPanel actions={actions} />
                {/* } */}
            </div>
        </div>
    )
}