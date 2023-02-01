import React, { useEffect, useState } from "react";
import Card from '../card/card';
import BankCoin from '../bank-coin/bank-coin';
import '../../style.css';
import './table.css';

export default function Table() {
    return (
        <div className="table">            
            <div className='table__wrapper'>
                <div className="table_stack">
                    <div className='table_card ani_card0'>
                        <Card value={7} type={2}></Card>
                    </div>
                    <div className='table_card ani_card1'>
                        <Card value={7} type={2}></Card>
                    </div>
                    <div className='table_card ani_card2'></div>
                    <div className='table_card ani_card3'></div>
                    <div className='table_card ani_card4'></div>                                   
                </div>   
                <BankCoin topValue={0} leftValue={182} />   
                <BankCoin topValue={30} leftValue={243}/>   
                <BankCoin topValue={40} leftValue={165}/>             
            </div>  
             
        </div>   
    )
}