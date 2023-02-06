import { GameLogic } from './game-logic';
import { IGameMessage } from '../interfaces';
import { testPlayers, originDeck } from './players-and-deck';
import { setBotChoise } from './bot-logic';

export class RoomLogic {
  condition: boolean;
  onMessage: (message: IGameMessage) => void;
  constructor() {
    this.condition = false;
    this.startGame();
  }

  startGame() {
    const game = new GameLogic(testPlayers(), originDeck);
    game.onMessage = (message: IGameMessage) => {
      console.log(message);
      switch (message.type) {
        case 'state':
        {  
          this.onMessage(message);
          break;}
        case 'ask':
        {
          this.onMessage(message);
          const currentPlayerIndex = message.data.playerId;
          console.log(currentPlayerIndex);
          const myPlayerIndex = 0;
          const withBots = false;
          if (withBots && currentPlayerIndex !== myPlayerIndex) {
            // if (!players[currentPlayerIndex].isFold) {
            setTimeout(() => {
              setBotChoise(message);
            }, 1000);
          } 
        break;}
        case 'winner':
          {
            alert('Game over');
            game.destroy();
            this.startGame();
            // setWinInfo(message.data);
            break;
          }
        case 'start': {
          this.onMessage(message);
        }
        default:
          break;
      }
    }
  }
  destroy() {
    
  }
}