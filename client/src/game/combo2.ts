import { ICard } from '../interfaces'

export const values: Array<ICardValue> = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'].reverse() as Array<ICardValue>;
const comboNames = ['nothing',
    'pair', 'two pair', 'three-of-a-kind', 'straight', 'flush', 'full house', 'four-of-a-kind', 'straight-flush'
];
function getRankValue(arr: Array<ICardValue>): number {
    // arr[i] * N ** i
    // ac * N + arr[i]
    const N = values.length;
    return arr.reduce((ac, it, i) => {
        // console.log(ac);
        return ac * N + values.indexOf(it) + 1;
    }, 0)
}

function getComboValue(combo: string, arr: Array<ICardValue>) {
    const maxRank = getRankValue(['A', 'A', 'A', 'A', 'A']);
    const comboIndex = comboNames.indexOf(combo);
    return maxRank * comboIndex + getRankValue(arr)
}

export function getWinner(players: Array<Array<string>>, table: Array<string>) {
    const playerHands = players.map(it => {
        const hnd = hand(it, table);
        return { h: hnd, val: getComboValue(hnd.type, hnd.ranks) }
    })
    return playerHands;
    /*return [...players].sort((a, b)=>{
        return compareHands(hand(a, table), hand(b, table))
    })*/
}

/*function compareRanks(a, b) {
    let res = 0;
    for (let i = 0; i < a.length; i++) {
        if (a[i] == b[i]) {

        } else {
            res = values.indexOf(a[i]) < values.indexOf(b[i]) ? 1 : -1;
            break;
        }
    }
    return res
}
compareRanks(['A', 'K', '10', '2'], ['A', 'K', '10', '4'])

function compareCombo(a, b) {
    if (a == b) return 0;
    return comboNames.indexOf(a) < comboNames.indexOf(b) ? 1 : -1;
}

function compareHands(a: { type: string, ranks: Array<string> }, b: { type: string, ranks: Array<string> }) {
    const combo = compareCombo(a.type, b.type);
    if (combo == 0) {
        return compareRanks(a.ranks, b.ranks);
    } else {
        return combo;
    }
}
*/
interface IInternalCard {
    value: number,
    type: string
}

type ICardValue = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
type ICardType = 'a' | 'b' | 'c' | 'd';

export function hand(holeCards: Array<string>, communityCards: Array<string>): { type: string, ranks: Array<ICardValue>, cards:Array<IInternalCard>} {
    const sorted:IInternalCard[] = [...holeCards, ...communityCards].map(it => {
        const cValue: ICardValue = it.slice(0, it.length - 1) as ICardValue;
        const value = values.indexOf(cValue);
        return {
            value,
            type: it[it.length - 1]
        }
    }).sort((a, b) => {
        return b.value - a.value
    });
    console.log(sorted)
   
    const calcTypeCount = (sorted:Array<{type:string, value: number}>) => count(sorted, (it=> it.type))
    const calcValueCount = (sorted:Array<{type:string, value: number}>) => count(sorted, (it=> it.value.toString()))

    const typesMap = calcTypeCount(sorted)
    const flushIndex = Object.keys(typesMap).find(it => typesMap[it] >= 5);
    if (flushIndex) {
        const straight = getStraight(sorted.filter(it => it.type == flushIndex));
        if (straight) {
            return { type: 'straight-flush', ranks: straight.map(it => values[+it.value]).slice(0, 5), cards: straight }
        }
        const flushCards = sorted.filter(it => it.type == flushIndex)
        const flushRanks = flushCards.map(it => values[+it.value]).slice(0, 5);
        console.log('flush', flushIndex);
        return { type: 'flush', ranks: flushRanks, cards: flushCards }
    }

    const straight = getStraight(sorted);
    if (straight) {
        //if (straight.every(it=> it.type == straight[0].type)){
        //  return {type:'straight-flush', ranks: straight.map(it=> values[+it.value])}
        //}
        return { type: 'straight', ranks: straight.map(it => values[+it.value]), cards: straight}
    }
    console.log(straight)

    const valuesMap = calcValueCount(sorted);
    const sortedKeys = Object.keys(valuesMap).sort((a, b) => {
        if (valuesMap[b] - valuesMap[a] != 0) {
            return valuesMap[b] - valuesMap[a]
        } else {
            return +b - +a;
        };
    })
    let len = 0;
    let ilen = 0;
    const ranks = sortedKeys.map(it => {
        if (len < 5) {
            len += valuesMap[it];
            ilen += 1;
        }
        return values[+it]
    }).slice(0, ilen);
    const cards:IInternalCard[] = [];
    ranks.forEach(it=>{
        const filtered = sorted.filter(card => values[+card.value] == it);
        filtered.forEach(card=>{
            cards.push(card);
        })
    })
    cards.splice(5);

    console.log(ranks)
    if (valuesMap[sortedKeys[0]] == 4) {
        console.log('four-of-a-kind')
        return { type: 'four-of-a-kind', ranks, cards}
    }
    if (valuesMap[sortedKeys[0]] == 3) {
        if (valuesMap[sortedKeys[1]] >= 2) {
            console.log('full house')
            return { type: 'full house', ranks, cards}
        } else {
            console.log('three-of-a-kind')
            return { type: 'three-of-a-kind', ranks, cards}
        }
    }
    if (valuesMap[sortedKeys[0]] == 2) {
        if (valuesMap[sortedKeys[1]] >= 2) {
            console.log('two pair')
            return { type: 'two pair', ranks, cards}
        } else {
            console.log('pair')
            return { type: 'pair', ranks, cards }
        }
    }
    if (valuesMap[sortedKeys[0]] == 1) {
        console.log('nothing')
        return { type: 'nothing', ranks, cards }
    }

    return { type: "TODO", ranks: [], cards };
}

function getStraight(sorted:Array<{type:string, value: number}>) {
    const straight: Array<{type:string, value: number}> = [];
    //console.log(sorted);
    const res = sorted.findIndex((it, index, arr) => {
        if (index >= arr.length - 1) return false;
        if (straight.length == 0) {
            //console.log('it', it);
            straight.push(it);
        }
        //console.log(JSON.stringify(straight.map(it=> it.value)), straight.length)
        if (arr[index + 1].value + 1 === straight[straight.length - 1].value) {
            straight.push(arr[index + 1])
            if (straight.length == 5) {
                return true;
            }
        } else if (arr[index + 1].value === straight[straight.length - 1].value) {

        } else {
            straight.splice(0)
        }
    })

    return res !== -1 ? straight : null
}

const count = <T, K extends number | string | symbol>(cards: Array<T>, getKey: (item: T) => K) => {
    const obj: Record<K, number> = {} as Record<K, number>;
    cards.forEach(it => {
        const key = getKey(it);
        if (obj[key]) {
            obj[key] += 1;
        } else {
            obj[key] = 1;
        }
    })
    return obj;
}

count([1, 2, 3, 4,], (it) => it)