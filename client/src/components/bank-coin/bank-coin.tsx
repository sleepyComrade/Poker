import React, { useEffect, useState } from "react";
import '../../style.css';
import './bank-coin.css';

type BankCoinProps = {
    topValue: number;
    leftValue: number;
    coinValue: number;
    color: string;
    duration?: number
}

export default function BankCoin({topValue, leftValue, coinValue, color, duration}: BankCoinProps) {
    const [init, setInit] = useState(false);
    
    useEffect(()=>{
        requestAnimationFrame(()=> requestAnimationFrame(()=>{
          setInit(true);  
        }))
    }, [])
    return (
        <div className={`bank-coin ${init==true? '' : ' bank-coin_init'}`} 
            style={{transitionDuration: duration ? duration +'ms' : null, top: `calc(var(--base) * ${topValue})`, left: `calc(var(--base) * ${leftValue})`, backgroundColor: color, boxShadow: `${color} 0px 8px 0px, #000 0px 8px 0px, #000 0px 8px 7px` }}>
            <div className="bank-coin__inner">{coinValue >= 1000 ? coinValue / 1000 + 'K' : coinValue}</div>
        </div>
    )
}