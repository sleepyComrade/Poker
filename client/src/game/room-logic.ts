import { GameLogic } from './game-logic';
import { IGameMessage, IPlayer } from '../interfaces';
import { testPlayers, originDeck } from './players-and-deck';
import { setBotChoise } from './bot-logic';
import { Player, BotPlayer, PlayerState } from './players';

export class RoomLogic {
  condition: boolean;
  onMessage: (message: IGameMessage) => void;
  players: (Player | BotPlayer)[];
  isStarted: boolean;
  constructor() {
    this.condition = false;
    this.players = [];
    this.isStarted = false;
    this.startGame();
  }

  join(player: Player | BotPlayer) {
    this.players.push(player);
    this.startGame();
  }

  leave(player: Player | BotPlayer) {
    this.players.splice(this.players.indexOf(player), 1);
  }

  startGame() {
    if (this.players.length < 2) {
      this.isStarted = false;
      return;
    }
    this.isStarted = true;
    const game = new GameLogic(this.players.map(player => new PlayerState(player.name)), originDeck);
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
          // if (withBots && currentPlayerIndex !== myPlayerIndex) {
            // if (!players[currentPlayerIndex].isFold) {
            // setTimeout(() => {
            //   setBotChoise(message);
            // }, 1000);
          // } 
          
        break;}
        case 'winner':
          {
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
      this.players.forEach(player => player.handleMessage(message));
    }
  }
  destroy() {
    
  }
}