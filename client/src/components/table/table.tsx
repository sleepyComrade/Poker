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

function sumToCoins(sum: number, values: Array<number>){
    let leftSum = sum;
    const res = values.map(it=>{
        const current = Math.floor(leftSum / it);
        leftSum = Math.floor(leftSum % it);
        return {count: current, coinValue: it};
    })
    return res;
}

function sumToCoinsMerged(sum: number, values: Array<number>, lastCoins: Array<{count: number, coinValue: number}>){
    const lastSum = lastCoins.reduce((ac, it) => ac+it.count * it.coinValue, 0);
    let leftSum = sum-lastSum;
    if (leftSum < 0){
        return sumToCoins(sum, coinValues);
    }
    const res = values.map(it=>{
        const current = Math.floor(leftSum / it);
        leftSum = Math.floor(leftSum % it);
        return {count: current, coinValue: it};
    })
    res.forEach(it=>{
        const ex = lastCoins.find(lastCoin => it.coinValue == lastCoin.coinValue );
        if (ex){
            ex.count += it.count;
        } else {
            lastCoins.push(it);
        }
    })
    return lastCoins;
}

const coinValues = [50000, 10000, 5000, 1000, 500, 100, 50, 10, 5, 1]
export default function Table({cards, bets}: TableProps) {
    /*const betCoins:{count: number, coinValue: number}[][] = useMemo(()=>{
        return bets.map((it, i)=> sumToCoinsMerged(it, coinValues, betCoins?.[i]||[]));
    }, [bets.join(', ')]);*/
    const [betCoins, setBetCoins] = useState<{count: number, coinValue: number}[][]>([]);
    useEffect(()=>{
        setBetCoins(last=>{
            return bets.map((it, i)=> sumToCoinsMerged(it, coinValues, last?.[i]||[]));
        })
    }, [bets.join(', ')]);
    
    return (
        <div className="table">            
            <div className='table__wrapper'>
                <div className="table_stack">
                    {cards.map((card, index) => (
                    <div className={`table_card ani_card${index}`}>
                        <Card key={index} value={card.value - 1} type={card.type - 1}></Card>
                    </div>))}
                </div> 
                {betCoins.map((pl, pli)=>{
                    return pl.filter(it=> it.count).reverse().map((it, index) => {
                        const stk = new Array(it.count).fill(null).map((jt, jdex)=> {
                            return <BankCoin key={[index, jdex, it.coinValue].join(',')} topValue={coinPositions[pli].top- jdex*6} leftValue={coinPositions[pli].left - index * 35} coinValue={it.coinValue} />
                        })
                        return stk;
                    })
                })} 
                {/*bets.map((it, index) => {
                    if(it == 0) return ;
                    return <BankCoin topValue={coinPositions[index].top} leftValue={coinPositions[index].left} />
                })*/}           
            </div>  
             
        </div>   
    )
}