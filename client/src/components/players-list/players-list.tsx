import React, { useEffect, useState } from "react";
import Player from '../player/player';
import MainPlayer from '../main-player/main-player';
import { IPlayer } from "../../interfaces";
import '../../style.css';
import './players-list.css';

type PlayersListProps = {
  players: Array<IPlayer>;
}

export default function PlayersList({ players }: PlayersListProps) {
  return (
    <>
      <div className="players-list">
        <MainPlayer />
        {players.map((player, index) =>
          <Player key={index} player={player} place={index + 1} />
        )}
      </div>
    </>

  )
}