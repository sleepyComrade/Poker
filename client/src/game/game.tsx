import React, { useEffect, useState } from "react";
import PlayerList from '../components/players-list/players-list';
import Table from '../components/table/table';
import ButtonsPanel from '../components/buttons-panel/buttons-panel';
import '../style.css';
import './game.css';
import { IActions, ICard, IPlayer } from "../interfaces";

type GameProps = {
    players: Array<IPlayer>;
    actions: IActions;
    cards: Array<ICard>;
    player: IPlayer;
}

export default function Game({ players, actions, cards, player }: GameProps) {
    return (
        <div className="game">
            <div className="game__wrapper">
                <div className="game__center-container">
                    <PlayerList players={players} player={player} />
                    <Table cards={cards} bets={players.map(it => it.bet)}/>
                </div>
                {/* {(!players[myPlayerIndex].isFold && currentPlayerIndex === myPlayerIndex) &&  */}
                <ButtonsPanel actions={actions} />
                {/* } */}
            </div>
        </div>
    )
}