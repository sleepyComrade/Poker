import React, { useEffect, useState } from "react";
import Player from '../player/player';
import MainPlayer from '../main-player/main-player';
import { ICard, IPlayer } from "../../interfaces";
import '../../style.css';
import './players-list.css';

type PlayersListProps = {
  players: Array<IPlayer>;
  player: IPlayer;
}

export default function PlayersList({ players, player }: PlayersListProps) {
  return (
    <>
      <div className="players-list">
        <MainPlayer player={player}/>
        {players.map((player, index) =>
          <Player key={index} player={player} place={index + 1} />
        )}
      </div>
    </>

  )
}