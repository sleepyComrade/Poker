import { IGameMessage, IDataAsk, IActions } from '../interfaces';

export const setBotChoise = (message: IGameMessage<IDataAsk>) => {
  const actions1: IActions = message.data.actions;
  console.log('Bot inside message: ', message);
  console.log('Bot actions: ', actions1);
  const num = Math.floor(Math.random() * Object.keys(actions1).length);
  const method = Object.keys(actions1)[num] as keyof typeof actions1;
  actions1[method]();
}

const testList = [];

export const createStaticChoise = (moveList: string[]) => {
  let move = 0;
  return (message: IGameMessage<any>) => {

  }
}