import React, { useEffect, useState } from "react";
import '../../style.css';
import './bank-coin.css';

type BankCoinProps = {
    topValue: number;
    leftValue: number;
    coinValue: number;
}

export default function BankCoin({topValue, leftValue, coinValue}: BankCoinProps) {
    const [init, setInit] = useState(false);
    useEffect(()=>{
        requestAnimationFrame(()=> requestAnimationFrame(()=>{
          setInit(true);  
        }))
    }, [])
    return (
        <div className={`bank-coin ${init==true? '' : ' bank-coin_init'}`} style={{top: topValue, left: leftValue}}>
            <div className="bank-coin__inner">{coinValue}</div>
        </div>
    )
}