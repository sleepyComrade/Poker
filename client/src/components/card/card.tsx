import React, { useEffect, useState } from "react";
import { ICard, IDataWinner } from "../../interfaces";
import '../../style.css';
import './card.css';
import { useAppContext } from "../../context";

type CardProps = {
    value: number;
    type: number;
    selected: boolean;
}

// export default function Card({ value, type }: CardProps) {
//     return (
//         <div className='card' style={{ width: "100%", height: "100%" }}>
//             <div className='card_base card_a card_img' style={{ '--value': value, '--type': type }} >
//             </div>
//             <div className='card_base card_b' style={{ '--value': 2, '--type': 4 }}>
//             </div>
//         </div>
//     )
// }

const types = ['\u2663', '\u2666', '\u2665', '\u2660'];
const values = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];

export default function Card({ value, type }: CardProps) {
    const scale = useAppContext().scale;
    return scale < 0.8 ? 
    (
        <div className={`card card-adaptive ${type == 1 || type == 2 ? 'card-adaptive--red' : 'card-adaptive--black'}`} style={{ width: "100%", height: "100%"}}>
            <div className='card-adaptive__wrapper card_base card_a' style={{ '--value': value, '--type': type }}>
                <div className='card-adaptive__value'>{values[value]}</div>
                <div className='card-adaptive__type'>{types[type]}</div>                
            </div>
            <div className='card-adaptive__wrapper card_base card_b' style={{ '--value': 2, '--type': 4 }}>
            </div>
        </div>
    ) : 
    (
        <div className='card' style={{ width: "100%", height: "100%" }}>
            <div className='card_base card_a card_img' style={{ '--value': value, '--type': type }} >
            </div>
            <div className='card_base card_b' style={{ '--value': 2, '--type': 4 }}>
            </div>
        </div>
    )
}