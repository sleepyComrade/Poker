import React, { useEffect, useState } from "react";
import '../../style.css';
import './card.css';

type CardProps = {
    value: number;
    type: number;
}

export default function Card({ value, type }: CardProps) {
    return (
        <div className='card' style={{ width: "100%", height: "100%" }}>
            <div className='card_base card_a card_img' style={{ '--value': value, '--type': type }}>
            </div>
            <div className='card_base card_b' style={{ '--value': 2, '--type': 4 }}>
            </div>
        </div>
    )
}