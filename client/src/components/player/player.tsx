import React, { useEffect, useState } from "react";
import TwoCards from '../two-cards/two-cards';
import '../../style.css';
import './player.css';
import { ICard, IPlayer } from "../../interfaces";

type PlayerProps = {
  player: IPlayer;
  place: number;
}

export default function Player({ player, place }: PlayerProps) {
  const { name, isFold, chips, cards, bet } = player;
  return (
    <div className={`abs player tp${place}`}>
      <div className='player_time'>
        <div className='player_ava'>AA</div>
      </div>
      <div className='player_nc_wrapper'>
        <div className='player_name'>{name}</div>
        <div className='player_cash'>23 456</div>
        {isFold ? 'Player is out' : ''}
        <div>{chips}</div>
      </div>
      <div>{bet > 0 && bet}</div>
      <TwoCards cards={cards} />
    </div>
  )
}