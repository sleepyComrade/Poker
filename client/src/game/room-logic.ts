import { GameLogic } from './game-logic';
import { IActions, IGameMessage, IPlayer } from '../interfaces';
import { testPlayers, originDeck } from './players-and-deck';
import { setBotChoise } from './bot-logic';
import { Player, BotPlayer, PlayerState } from './players';

export class RoomLogic {
  condition: boolean;
  onMessage: (message: IGameMessage) => void;
  players: (Player | BotPlayer | null)[];
  isStarted: boolean;
  currentPlayerIndex: number;
  dealerIndex: number;
  inactivePlayers: Player[];
  lastState: IGameMessage;
  constructor() {
    this.condition = false;
    this.players = Array(9).fill(null);
    this.inactivePlayers = [];
    this.isStarted = false;
    this.currentPlayerIndex = 0;
    this.dealerIndex = 0;
    this.startGame();
  }

  join(player: Player | BotPlayer) {
    if (this.lastState) {
      player.handleMessage(this.lastState);
    }
    const emptyIndex = this.players.indexOf(null);
    if (emptyIndex < 0) {
      console.log('Room is full');
      this.inactivePlayers.push(player);
      return 0;
    }
    this.players[emptyIndex] = player;
    if (!this.isStarted) {
      this.startGame();
    }
    return emptyIndex;
  }

  leave(player: Player | BotPlayer) {
    // if (player) {
    //   this.inactivePlayers.splice(this.players.indexOf(player), 1, null);
    // }
    // this.players[this.players.indexOf(player)].
    this.players.splice(this.players.indexOf(player), 1, null);
    console.log('Update: ', this.players);
  }

  startGame() {
    const activePlayers = this.players.filter(player => player);
    activePlayers.forEach(player => player.isOut = true)
    if (activePlayers.length < 2) {
      this.isStarted = false;
      return;
    }
    this.isStarted = true;
    const game = new GameLogic(this.players.map(player => player ?
                               new PlayerState(false, false, player.name, player.chips) :
                               new PlayerState(true, true, 'Empty', 0)), originDeck, this.dealerIndex);
    game.onMessage = (message: IGameMessage) => {
      console.log('Message: ', message);
      switch (message.type) {
        case 'state':
        {
          this.lastState = message;
          this.players.forEach(player => player?.handleMessage(message));
          this.inactivePlayers.forEach(player => player?.handleMessage(message));
          // this.currentPlayerIndex = message.data.currentPlayerIndex;
          this.onMessage?.(message);
          break;}
        case 'ask':
        {
          const currentPlayerIndex = message.data.playerId;
          if (!this.players[currentPlayerIndex]) {
            return
          }
          const a = setTimeout(() => {
            if (message.data.actions.check) {
              message.data.actions.check();
            } else if (message.data.actions.fold) {
              message.data.actions.fold();
            }
          }, 5000)

          const q: IActions = {}
          Object.keys(message.data.actions).forEach((actionKey) => {
            q[actionKey as keyof IActions] = () => {
              clearTimeout(a);
            console.log("ChtoNibud", currentPlayerIndex)
              if (this.players[currentPlayerIndex]) {
                this.players[currentPlayerIndex].isOut = false;
                message.data.actions[actionKey]();
              }
            }
          })

          const m = {
            ...message,
            data: {
              ...message.data,
              actions: q
            }
          }

          // console.log("!!!!!",message)
          // console.log("!!!!!",m)

          this.players[currentPlayerIndex].handleMessage(m);
          this.players.forEach(player => {
            if (player !== this.players[currentPlayerIndex]) {
              player?.handleMessage({ type: 'askOther', data: { playerId: currentPlayerIndex }});
            }
          });
          this.inactivePlayers.forEach(player => {
            player?.handleMessage({ type: 'askOther', data: { playerId: currentPlayerIndex }});
          })
          this.onMessage?.(message);
          // console.log(currentPlayerIndex);
          // const myPlayerIndex = 0;
          // const withBots = false;
          // if (withBots && currentPlayerIndex !== myPlayerIndex) {
            // if (!players[currentPlayerIndex].isFold) {
            // setTimeout(() => {
            //   setBotChoise(message);
            // }, 1000);
          // } 
        break;}
        case 'winner':
          {
            this.players.forEach(player => player?.handleMessage(message));
            this.inactivePlayers.forEach(player => player?.handleMessage(message));
            // alert('Finish');
            game.destroy();
            // this.leave(this.players[Math.floor(Math.random() * this.players.length)]);

            this.dealerIndex = this.setDealerIndex((this.dealerIndex +  1) % this.players.length);
            this.isStarted = false;

            this.players.forEach((player, i) => {
              if (player && player.isOut) {
                // this.leave(this.players[i]);
                this.inactivePlayers.push(this.players.splice(this.players.indexOf(player), 1, null)[0]);
              }
            })

            this.startGame();
            // setWinInfo(message.data);
            break;
          }
        case 'start': {
          this.players.forEach(player => player?.handleMessage(message));
          this.inactivePlayers.forEach(player => player?.handleMessage(message));
          this.onMessage?.(message);
        }
        default:
          break;
      }
      console.log('Id: ', message.data.playerId);
      // this.players[this.currentPlayerIndex].handleMessage(message);
      // this.players.forEach(player => player.handleMessage(message));
    }
  }

  setDealerIndex(curIndex: number) {
    const getNextIndex = (cur: number) => (cur +  1) % this.players.length;
    const getNewInitialIndex = (last: number): number => !this.players[getNextIndex(last)] ?
                                                         getNewInitialIndex(getNextIndex(last)) :
                                                         getNextIndex(last);
    return !this.players[curIndex] ? getNewInitialIndex(curIndex) : curIndex;
  }

  checkTable() {
    return this.players.every(player => player);
  }

  destroy() {
    
  }
}