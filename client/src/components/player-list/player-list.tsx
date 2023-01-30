import React, { useEffect, useState } from "react";
import Player from '../player/player';
import '../../style.css';
import './player-list.css';

export default function PlayerList() {
    return (
        <div className="player-list">
            <Player place={1} />
            <Player place={2} />
            <Player place={3} />
            <Player place={4} />
            <Player place={5} />
            <Player place={6} />
        </div>
    )
}