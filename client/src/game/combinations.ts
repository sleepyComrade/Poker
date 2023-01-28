import { ICard } from '../interfaces';

export function getCombo(cards: Array<ICard>) {

}

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

function createCards() {
  const cards = [];
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 4; j++) {
      const card = {
        value: i,
        type: j
      }
      cards.push(card);
    }
  }
  return cards;
}

function mixCards(cards: Array<ICard>) {
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
  cards.sort((a, b) => b.value - a.value).map((it, index) => cards[index + 1].value - 1 === it.value)
}