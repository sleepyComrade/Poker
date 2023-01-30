import React, { useEffect, useState } from "react";
import '../../style.css';
import './card.css';

export default function Card({value, type}: {value:number, type:number}) {
    return (
        <div className='card_wrapper' style={{width:"100%", height: "100%"}}>
            <div className='card_base card_a card_img' style={{'--value': value, '--type': type}}>

            </div>
            <div className='card_base card_b card_img' style={{'--value': 2, '--type': 4}}>
                
            </div>
        </div>
    )
}