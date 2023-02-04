import React, { useEffect, useState } from "react";
import Card from '../card/card';
import BankCoin from '../bank-coin/bank-coin';
import '../../style.css';
import './table.css';
import { ICard } from "../../interfaces";

type TableProps ={
    cards: Array<ICard>;
    bets: Array<number>;
}
const bankPosition = {
    top: 0,
    left: 304,
}
const coinPositions = [
    {
        top: 37,
        left: 114,
    },
    {
        top: -26,
        left: 170,
    },
    {
        top: -26,
        left: 438,
    },
    {
        top: 52,
        left: 494,
    },
    {
        top: 183,
        left: 494,
    },  
    {
        top: 284,
        left: 495,
    },
    {
        top: 284,
        left: 268,
    },
    {
        top: 284,
        left: 67,
    },
    {
        top: 196,
        left: 114,
    }
]

export default function Table({cards, bets}: TableProps) {
    return (
        <div className="table">            
            <div className='table__wrapper'>
                <div className="table_stack">
                    {cards.map((card, index) => (
                    <div className={`table_card ani_card${index}`}>
                        <Card key={index} value={card.value - 1} type={card.type - 1}></Card>
                    </div>))}
                </div>   
                {bets.map((it, index) => {
                    if(it == 0) return ;
                    return <BankCoin topValue={coinPositions[index].top} leftValue={coinPositions[index].left} />
                })}           
            </div>  
             
        </div>   
    )
}