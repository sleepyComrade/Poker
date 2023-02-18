import React, { useEffect, useState } from "react";
import Card from '../card/card';
import BankCoin from '../bank-coin/bank-coin';
import '../../style.css';
import './table.css';
import { ICard, IDataWinner, IDataWinnerLegacy } from "../../interfaces";

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
const chipHeight = 6;
const chipWidth = 35;
const maxPlayers = 9;
const baseChipAnimationMoveTime = 400;
const chipAnimationMoveDelay = 50;

interface IChipStack{ 
    count: number, 
    coinValue: number 
}

function ChipsStack({stacks, baseX, baseY, baseTime}: {stacks:IChipStack[], baseX: number, baseY: number, baseTime?: number}){
    return (
    <>
        {stacks.filter(it => it.count).reverse().map((it, index) => {
            const stk = new Array(it.count).fill(null).map((jt, jdex) => {
                const time = (baseTime) ? jdex * chipAnimationMoveDelay + baseTime : null;
                return <BankCoin 
                    color={colors[coinValues.indexOf(it.coinValue)]}
                    key={[index, jdex, it.coinValue].join(',')} 
                    topValue={baseY - jdex * chipHeight} 
                    leftValue={baseX - index * chipWidth} 
                    coinValue={it.coinValue} 
                    duration = {time}
                />
            })
            return stk;
        })}
    </>
    );
}

const BankStacks = (winInfo: IDataWinnerLegacy, bankCoin: IChipStack[], splitAnimationFlag: boolean, playerIndex:number)=>{
    const stacks = bankCoin.filter(it => it.count).reverse();
    const top = bankPosition.top;
    const left = bankPosition.left;
    const cycleIndex = winInfo && (maxPlayers + winInfo.winIndex - playerIndex) % maxPlayers;
    const winTop = winInfo && coinPositions[cycleIndex].top;
    const winLeft = winInfo && coinPositions[cycleIndex].left;
    const time = (winTop != null && winTop != null) ? baseChipAnimationMoveTime : null;
    winInfo && console.log(winInfo.winIndex, playerIndex, cycleIndex)
    return <ChipsStack stacks={stacks} baseX = {(!splitAnimationFlag && winLeft) || left} baseY = {(!splitAnimationFlag && winTop) || top} baseTime ={time}/>
}

export default function Table({ cards, bets, bank, winCards, winInfo, playerIndex }: TableProps) {
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

    const [splitAnimationFlag, setSplitAnimationFlag] = useState(false);
    const [splitBankCoin, setSplitBankCoin] = useState<{ count: number, coinValue: number }[][]>(null);

    useEffect(() => {
        if (winInfo && winInfo.winners && winInfo.winners.length>1){
            setBankCoin([]);
            setSplitAnimationFlag(true);
            setSplitBankCoin(winInfo.winners.map(((winner:IDataWinner) => {
                const minChip = 50;
                return sumToCoinsMerged(winner.count - winner.count % minChip, coinValues, []);
            })));
            
        } else {
            setSplitBankCoin(null);
        }
    }, [bank, winInfo]);

    useEffect(()=>{
        let raf: number | null = null;
        if (splitAnimationFlag){
            raf = requestAnimationFrame(()=> raf = requestAnimationFrame(()=>{
                setSplitAnimationFlag(false);
            }))
        }
        return ()=>{
            cancelAnimationFrame(raf);
        }
    }, [splitAnimationFlag]);

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
                    {
                        !splitBankCoin && BankStacks(winInfo, bankCoin, false, playerIndex)  
                    }
                    {
                        winInfo && winInfo.winners && splitBankCoin && splitBankCoin.map((_bankCoin, windex) => {
                            const _winInfo = winInfo.winners[windex]
                            return BankStacks(_winInfo, _bankCoin, splitAnimationFlag, playerIndex)
                        })
                    }
                    
                </div>
                {
                    betCoins.map((stacks, playerIndex) => {
                        return <ChipsStack stacks={stacks} baseX = {coinPositions[playerIndex].left} baseY = {coinPositions[playerIndex].top}/>
                    })
                }

            </div>

        </div>
    )
}