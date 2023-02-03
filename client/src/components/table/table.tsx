import React, { useEffect, useState } from "react";
import Card from '../card/card';
import BankCoin from '../bank-coin/bank-coin';
import '../../style.css';
import './table.css';
import { ICard } from "../../interfaces";

type TableProps ={
    cards: Array<ICard>;
}

export default function Table({cards}: TableProps) {
    return (
        <div className="table">            
            <div className='table__wrapper'>
                <div className="table_stack">
                    {cards.map((card, index) => (
                    <div className={`table_card ani_card${index}`}>
                        <Card key={index} value={card.value - 1} type={card.type - 1}></Card>
                    </div>))}
                </div>   
                <BankCoin topValue={0} leftValue={182} />   
                <BankCoin topValue={30} leftValue={243}/>   
                <BankCoin topValue={40} leftValue={165}/>             
            </div>  
             
        </div>   
    )
}