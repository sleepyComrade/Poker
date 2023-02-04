import React, { useEffect, useState } from "react";
import { ICard } from "../../interfaces";
import '../../style.css';
import '../two-cards/two-cards';
import './two-cards--main-player.css';

type TwoCardsMainPlayerProps = {
  cards: Array<ICard>;
  isFold: boolean;
}

export default function TwoCardsMainPlayer({ cards, isFold }: TwoCardsMainPlayerProps) {
  return (
    <div className='card_stack'>
      {cards.map((card) => {
        return (
          <div className={`hand_zero hand_zero--main-player ${isFold ? 'hand_fold' : ''}`} >
            <div className={'card_wrapper card_wrapper--main-player'}>
              <div className='card_base card_a card_img' style={{ '--value': card.value - 1, '--type': card.type - 1 }}>
              </div>
              <div className='card_base card_b'>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
