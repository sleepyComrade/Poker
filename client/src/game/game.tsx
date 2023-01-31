import React, { useEffect, useState } from "react";
import PlayerList from '../components/player-list/player-list';
import Table from '../components/table/table';
import ButtonsPanel from '../components/buttons-panel/buttons-panel';
import '../style.css';
import './game.css';

export default function Game() {
    return (
        <div className="game">
            <div className="game__wrapper">
                <PlayerList />         
                <Table />                        
                <ButtonsPanel />                       
            </div>            
        </div>
    )
}