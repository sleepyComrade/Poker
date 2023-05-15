import React, { useEffect, useState } from "react";
import Card from '../card/card';
import BankCoin from '../bank-coin/bank-coin';
import '../../style.css';
import './table.css';
import { ICard, IDataWinner, IDataWinnerLegacy, IPlayer } from "../../interfaces";
import { bankPosition, coinPositions, coinValues, sumToCoinsMerged, sumToCoins } from './chips-tools';
import { sounds } from "../../game/sounds";

type TableProps = {
    cards: Array<ICard>;
    players: Array<IPlayer>;
    bank: number;
    winCards: Array<ICard> | null;
    winInfo: IDataWinner;
    playerIndex: number;
}


const colors = ['#960dcc', '#42c008', '#dd0f98', '#220ddd', '#ff8800', '#f00', '#05b2c9', '#013a01', '#ddcf0f', '#f04d55'];
const chipHeight = 6;
const chipWidth = 35;
const maxPlayers = 9;
const baseChipAnimationMoveTime = 400;
const chipAnimationMoveDelay = 50;
const isDebug = false;

interface IChipStack{ 
    count: number, 
    coinValue: number 
}

function ChipsStack({stacks, baseX, baseY, baseTime, name}: {stacks:IChipStack[], baseX: number, baseY: number, baseTime?: number, name: string}){

    return (
        <>
            {isDebug && name && <div style={{ 'left': baseX, 'top': baseY, 'position': 'absolute', 'zIndex': '2000' }}>{name}
            </div>}
            {stacks.filter(it => it.count).reverse().map((it, index) => {
                if(it.count < 0) {
                    console.log('wrong count', it.count);
                }
                const stk = new Array(it.count).fill(null).map((jt, jdex) => {
                    const time = (baseTime) ? jdex * chipAnimationMoveDelay + baseTime : null;
                    return <BankCoin
                        color={colors[coinValues.indexOf(it.coinValue)]}
                        key={[index, jdex, it.coinValue].join(',')}
                        topValue={baseY - jdex * chipHeight}
                        leftValue={baseX - index * chipWidth}
                        coinValue={it.coinValue}
                        duration={time}
                    />
                })
                return stk;
            })}
        </>
    );
}

const BankStacks = (winInfo: IDataWinnerLegacy, bankCoin: IChipStack[], splitAnimationFlag: boolean, playerIndex:number, name: string = '')=>{
    const stacks = bankCoin.filter(it => it.count);
    const top = bankPosition.top;
    const left = bankPosition.left;
    const cycleIndex = winInfo && (maxPlayers * 2 + winInfo.winIndex - playerIndex) % maxPlayers;
    if (!coinPositions[cycleIndex] && winInfo) {
      console.log('Bank stacks!!!!!!!!',cycleIndex, playerIndex, winInfo.winIndex);
    }
    const winTop = winInfo && coinPositions[cycleIndex].top;    
    const winLeft = winInfo && coinPositions[cycleIndex].left;
    const time = (winTop != null && winTop != null) ? baseChipAnimationMoveTime : null;
    winInfo && console.log(winInfo.winIndex, playerIndex, cycleIndex)
    return <ChipsStack name={name} stacks={stacks} baseX = {(!splitAnimationFlag && winLeft) || left} baseY = {(!splitAnimationFlag && winTop) || top} baseTime ={time}/>
}

export default function Table({ cards, players, bank, winCards, winInfo, playerIndex }: TableProps) {
    const [betCoins, setBetCoins] = useState<{ count: number, coinValue: number }[][]>([]);
    useEffect(() => {
        setBetCoins(last => {
            return players.map((it, i) => sumToCoinsMerged(it.bet, coinValues, last?.[i] || []));
        })
        sounds.chips();
    }, [players.map(it => it.bet).join(', ')]);

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
                        <div key={index} className={`table_card ani_card${index} ${winCards?.find(it => (it.type == card.type) && (it.value == card.value)) ? 'winner-card' : ''}` } >
                            <Card key={index} value={card.value} type={card.type - 1} selected={false}></Card>
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
                        return <ChipsStack key={playerIndex} name={players[playerIndex].name + playerIndex} stacks={stacks} baseX = {coinPositions[playerIndex].left} baseY = {coinPositions[playerIndex].top}/>
                    })
                }

            </div>

        </div>
    )
}