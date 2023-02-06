import { IGameMessage } from '../interfaces';

export const setBotChoise = (message: IGameMessage) => {
  const actions1 = message.data.actions;
  console.log(actions1);
  const num = Math.floor(Math.random() * Object.keys(actions1).length);
  const method = Object.keys(actions1)[num] as keyof typeof actions1;
  actions1[method]();
}

const testList = [];

export const createStaticChoise = (moveList: string[]) => {
  let move = 0;
  return (message: IGameMessage) => {

  }
}