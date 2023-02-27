import { ICard } from '../interfaces';

function getMaxCard(cards: Array<ICard>) {
  return cards.sort((a, b) => a.value - b.value)[0];
}

function getMaxPair(cards: Array<ICard>, count: number) {
  // const cards2 = cards.sort((a, b) => a.value - b.value);
  const obj: Record<number, number> = {}
  cards.forEach((it, index) => {
    if (obj[it.value]) {
      obj[it.value] += 1;
    } else {
      obj[it.value] = 1;
    }
  })
  // Object.keys(obj).filter(it => obj[+it] == 2).map(it => {
  //     const value = +it;
  //     return cards.filter(it => it.value == value);
  // })
  //
  const pairs = Object.keys(obj).filter(it => obj[+it] == count).sort((a, b) => +b - +a);
  const maxPair = pairs[0] || null;
  if (maxPair !== null) {
    return cards.filter(it => it.value == +maxPair);
  } else {
    return null;
  }
}

export function createCards() {
  const cards = [];
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 4; j++) {
      const card = {
        value: i + 1,
        type: j + 1
      }
      cards.push(card);
    }
  }
  return cards;
}

export function mixCards(cards: Array<ICard>) {
  const arr = [];
  const cards2 = [...cards];
  while (cards2.length) {
    const randomIndex = Math.floor(Math.random() * cards2.length);
    const el = cards2[randomIndex];
    cards2[randomIndex] = cards2[cards2.length - 1];
    arr.push(el);
    cards2.pop()
  }

  return arr;
}

const cards = mixCards(createCards()).slice(0, 7);
console.log(cards);

console.log(getMaxPair(cards, 2));

function getStraight(cards: Array<ICard>) {
  const straight:Array<ICard> = [];
  const sorted = [...cards].sort((a, b) => b.value - a.value);
  //console.log(sorted);
  const res = sorted.findIndex((it, index, arr) => {
    if (index >= arr.length - 1) return false;
    if (straight.length == 0){
      //console.log('it', it);
      straight.push(it);
    }
   //console.log(JSON.stringify(straight.map(it=> it.value)), straight.length)
    if(arr[index + 1].value + 1 === straight[straight.length-1].value){
      straight.push(arr[index + 1])
      if (straight.length == 5){
        return true;
      }
    } else if(arr[index + 1].value === straight[straight.length-1].value){

    } else {
      straight.splice(0)
    }
  })

  return res !== -1 ? straight : null
}

new Array(250).fill(null).forEach(it=>{
  const cards = mixCards(createCards()).slice(0, 7);
  const st = getStraight(cards)
  st && console.log('straight ', st);
})

function getFlash(cards: Array<ICard>) {
  const straight:Array<ICard> = [];
  const sorted = [...cards].sort((a, b) => {
    if (b.type > a.type){
      return 1
    } else if (b.type == a.type){
      return b.value-a.value
    } else {
      return -1;
    }
  });
  //console.log(sorted);
  const res = sorted.findIndex((it, index, arr) => {
    if (index>= arr.length - 1) return false;
    if (straight.length == 0){
      //console.log('it', it);
      straight.push(it);
    }
   //console.log(JSON.stringify(straight.map(it=> it.value)), straight.length)
    if(arr[index + 1].type === straight[straight.length-1].type){
      straight.push(arr[index + 1])
      if (straight.length == 5){
        return true;
      }
    } else {
      straight.splice(0)
    }
  })

  return res !== -1 ? straight : null
}

export function getCombo(cards: Array<ICard>) {
  const flash = getFlash(cards);
  if (flash){
    console.log('flash', flash);
  }
  const straight = getStraight(cards);
  if (flash){
    console.log('straight', straight);
  }
  if (straight){
    const stFlash = getFlash(straight);
    if (stFlash){
      console.log('stflash', stFlash);
    }  
  }
  const four = getMaxPair(cards, 4);
  const three = getMaxPair(cards, 3);
  if (three){
   const nextCards = cards.filter(it=> !three.includes(it));
   const th = getMaxPair(nextCards, 3);
   const tw = getMaxPair(nextCards, 2);
   if (th || tw){
    console.log('fullhouse', three, (tw || th).slice(0, 2));
   }
  }
  const pair = getMaxPair(cards, 2);
  if (pair){
    const nextCards = cards.filter(it=> !pair.includes(it));
    const tw = getMaxPair(nextCards, 2);
    if (tw){
     console.log('two pair', pair, tw);
    } else {
      console.log('pair', pair)
    }
  }
}
