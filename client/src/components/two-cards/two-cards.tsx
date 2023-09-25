import React, { useEffect, useState } from "react";
import { ICard } from "../../interfaces";
import '../../style.css';
import './two-cards.css';

type TwoCardsProps = {
  cards: Array<ICard>;
  isFold: boolean;
  isOpened: boolean;
  winCards: Array<ICard> | null;
}

export default function TwoCards({ cards, isFold, isOpened, winCards }: TwoCardsProps) {

  return (
    <div className='card_stack'>
      {cards.map((card, index) => {
        return (
          <div className={`hand_zero ${isFold ? 'hand_fold' : ''}`} key={index} >
            <div className={`card_wrapper ${index === 1 ? 'card_rotate' : ''} ${winCards?.find(it => (it.type == card.type) && (it.value == card.value)) ? 'winner-player-card' : ''}`} style={{'--c-phase': isOpened ? 0 : 100}}>
              <div className='card_base card_a card_img' style={{ '--value': card.value, '--type': card.type - 1 }}>
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
