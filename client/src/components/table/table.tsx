import React, { useEffect, useState } from "react";
import Card from '../card/card';
import BankCoin from '../bank-coin/bank-coin';
import '../../style.css';
import './table.css';
import { ICard, IDataWinner } from "../../interfaces";

type TableProps = {
    cards: Array<ICard>;
    bets: Array<number>;
    bank: number;
    winCards: Array<ICard> | null;
    winInfo: IDataWinner;
    playerIndex: number;
}
const bankPosition = {
    top: -5,
    left: 330,
}
const coinPositions = [
    {
        top: 37,
        left: 55,
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
        left: 550,
    },
    {
        top: 185,
        left: 550,
    },
    {
        top: 284,
        left: 495,
    },
    {
        top: 270,
        left: 310,
    },
    {
        top: 270,
        left: 85,
    },
    {
        top: 185,
        left: 45,
    }
]

function sumToCoins(sum: number, values: Array<number>) {
    let leftSum = sum;
    const res = values.map(it => {
        const current = Math.floor(leftSum / it);
        leftSum = Math.floor(leftSum % it);
        return { count: current, coinValue: it };
    })
    return res;
}

function sumToCoinsMerged(sum: number, values: Array<number>, lastCoins: Array<{ count: number, coinValue: number }>) {
    const lastSum = lastCoins.reduce((ac, it) => ac + it.count * it.coinValue, 0);
    let leftSum = sum - lastSum;
    if (leftSum < 0) {
        return sumToCoins(sum, coinValues);
    }
    const res = values.map(it => {
        const current = Math.floor(leftSum / it);
        leftSum = Math.floor(leftSum % it);
        return { count: current, coinValue: it };
    })
    res.forEach(it => {
        const ex = lastCoins.find(lastCoin => it.coinValue == lastCoin.coinValue);
        if (ex) {
            ex.count += it.count;
        } else {
            lastCoins.push(it);
        }
    })
    return lastCoins;
}

const coinValues = [50000, 10000, 5000, 1000, 500, 100, 50, 10, 5, 1];
const colors = ['#960dcc', '#42c008', '#dd0f98', '#220ddd', '#ff8800', '#f00', '#05b2c9', '#013a01', '#ddcf0f', '#f04d55'];


export default function Table({ cards, bets, bank, winCards, winInfo, playerIndex }: TableProps) {
    /*const betCoins:{count: number, coinValue: number}[][] = useMemo(()=>{
        return bets.map((it, i)=> sumToCoinsMerged(it, coinValues, betCoins?.[i]||[]));
    }, [bets.join(', ')]);*/
    const [betCoins, setBetCoins] = useState<{ count: number, coinValue: number }[][]>([]);
    useEffect(() => {
        setBetCoins(last => {
            return bets.map((it, i) => sumToCoinsMerged(it, coinValues, last?.[i] || []));
        })
    }, [bets.join(', ')]);

    const [bankCoin, setBankCoin] = useState<{ count: number, coinValue: number }[]>([]);
    useEffect(() => {
        setBankCoin(last => {
            return sumToCoinsMerged(bank || 0, coinValues, last || []);
        })
    }, [bank]);

    return (
        <div className="table">
            <div className='table__wrapper'>
                <div className="table_stack">
                    {cards.map((card, index) => (
                        <div className={`table_card ani_card${index} ${winCards?.find(it => (it.type == card.type) && (it.value == card.value)) ? 'winner-card' : ''}` } 
                        // style={winCards?.map(it => (it.type === card.type) && (it.value === card.value) ? {'border': '2px solid red'} : '')}
                         >
                            <Card key={index} value={card.value} type={card.type - 1} selected={false} ></Card>
                        </div>))}                        
                </div>
                <div className="table__bank-coin-wrapper">
                  <div className="table__bank">{bank > 0 ? bank : ''}</div>
                    {bankCoin.filter(it => it.count).reverse().map((it, index) => {
                        const stk = new Array(it.count).fill(null).map((jt, jdex) => {
                            const top = bankPosition.top- jdex*6;
                            const left = bankPosition.left - index * 35;
                            const winTop = winInfo && coinPositions[(9 + winInfo.winIndex - playerIndex) % 9].top- jdex*6;
                            const winLeft = winInfo && coinPositions[(9 + winInfo.winIndex - playerIndex) % 9].left - index * 35;
                            const time = (winTop !== null && winTop !==undefined) ? jdex * 50 + 400 : null;
                            return <BankCoin color={colors[coinValues.indexOf(it.coinValue)]}
                                key={[index, jdex, it.coinValue].join(',')} topValue={winTop || top} leftValue={winLeft || left} coinValue={it.coinValue} duration={time} />
                        })
                        return stk;
                    })}
                </div>

                {betCoins.map((pl, pli) => {
                    return pl.filter(it => it.count).reverse().map((it, index) => {
                        const stk = new Array(it.count).fill(null).map((jt, jdex) => {
                            return <BankCoin color={colors[coinValues.indexOf(it.coinValue)]}
                                key={[index, jdex, it.coinValue].join(',')} topValue={coinPositions[pli].top - jdex * 6} leftValue={coinPositions[pli].left - index * 35} coinValue={it.coinValue} />
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