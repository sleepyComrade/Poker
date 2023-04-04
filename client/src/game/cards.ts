import { ICard } from "../interfaces";

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