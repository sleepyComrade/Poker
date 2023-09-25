import React, { useEffect, useState } from "react";
import { ICard } from "../../interfaces";
import '../../style.css';
import '../two-cards/two-cards';
import './two-cards--main-player.css';

type TwoCardsMainPlayerProps = {
  cards: Array<ICard>;
  isFold: boolean;
  winCards: Array<ICard> | null;
}

export default function TwoCardsMainPlayer({ cards, isFold, winCards }: TwoCardsMainPlayerProps) {
  return (
    <div className='card_stack'>
      {cards.map((card, index) => {
        return (
          <div className={`hand_zero hand_zero--main-player ${isFold ? 'hand_fold' : ''}`} key={index}>
            <div className={`card_wrapper card_wrapper--main-player ${winCards?.find(it => (it.type == card.type) && (it.value == card.value)) ? 'winner-player-card' : ''}`}>
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
