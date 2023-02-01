import React, { useEffect, useState } from "react";
import '../../style.css';
import './two-cards.css';


export default function TwoCards() {
    return (
        <div className='card_stack'>
            <div className='hand_zero'>
                <div className='card_wrapper'>
                    <div className='card_base card_a'>
                    </div>
                    <div className='card_base card_b'>
                    </div>
                </div>
            </div>
            <div className='hand_zero'>
                <div className='card_wrapper card_wrapper_second'>
                    <div className='card_base card_a'>
                    </div>
                    <div className='card_base card_b'>
                    </div>
                </div>
            </div>

        </div>
    )
}
