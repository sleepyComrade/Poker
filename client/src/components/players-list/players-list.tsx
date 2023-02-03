import React, { useEffect, useState } from "react";
import Player from '../player/player';
import MainPlayer from '../main-player/main-player';
import BankCoin from '../bank-coin/bank-coin';
import { ICard, IPlayer } from "../../interfaces";
import '../../style.css';
import './players-list.css';

type PlayersListProps = {
  players: Array<IPlayer>;
  player: IPlayer;
}
function shift<T>(arr: Array<T>, count: number) {
  for(let i = 0; i < count; i++) {
    arr.push(arr.shift());
  }
  return arr;
}

export default function PlayersList({ players, player }: PlayersListProps) {
  const _players = [...players];
  const playerIndex = _players.indexOf(player) + 3;
  shift(_players, playerIndex);
  
  return (
    <>
      <div className="players-list">
        <MainPlayer player={player}/>
        {_players.filter(it => it != player).map((_player, index) => {
          if(_player == player) return;

          return (
          <>
            <Player key={index} player={_player} place={index+1} />
            <BankCoin topValue={10} leftValue={100}/>
          </>
          )           
        }          
        )}
      </div>
    </>
  )
}