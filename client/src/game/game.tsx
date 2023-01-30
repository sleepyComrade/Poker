import React, { useEffect, useState } from "react";
import Table from '../components/table/table';
import '../style.css';
import './game.css';

export default function Game() {
    return (
        <div className="game">
            <div className="game__wrapper">
                <Table />
            </div>
        </div>
    )
}