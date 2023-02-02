import React, { useEffect, useState } from "react";
import PlayerList from '../components/players-list/players-list';
import Table from '../components/table/table';
import ButtonsPanel from '../components/buttons-panel/buttons-panel';
import '../style.css';
import './game.css';
import { IPlayer } from "../interfaces";

type GameProps = {
    players: Array<IPlayer>
}

export default function Game({players}: GameProps) {
    return (
        <div className="game">
            <div className="game__wrapper">
                <PlayerList players={players}/>         
                <Table />  
                <ButtonsPanel />   
            </div> 
        </div>
    )
}