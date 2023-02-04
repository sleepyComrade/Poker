import React, { useEffect, useState } from "react";
import { ICard } from "../../interfaces";
import '../../style.css';
import './two-cards.css';

type TwoCardsProps = {
  cards: Array<ICard>;
  isFold: boolean;
}

export default function TwoCards({ cards, isFold }: TwoCardsProps) {

  return (
    <div className='card_stack'>
      {cards.map((card, index) => {
        return (
          <div className={`hand_zero ${isFold ? 'hand_fold' : ''}`} >
            <div className={`card_wrapper ${index === 1 ? 'card_rotate' : ''}`}>
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
