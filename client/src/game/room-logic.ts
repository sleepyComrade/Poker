import { GameLogic } from './game-logic';
import { IActions, IGameMessage, IPlayer, IDataState, IDataAsk } from '../interfaces';
import { testPlayers, originDeck } from './players-and-deck';
import { setBotChoise } from './bot-logic';
import { Player, BotPlayer, PlayerState } from './players';
import { PlayerClient } from './player-client';

export class RoomLogic {
  condition: boolean;
  onMessage: (message: IGameMessage<any>) => void;
  players: (Player | BotPlayer | null)[];
  isStarted: boolean;
  currentPlayerIndex: number;
  dealerIndex: number;
  inactivePlayers: Player[];
  lastState: IGameMessage<any>;
  onPlayerLeave: () => void;
  expectant: Player;
  constructor() {
    this.condition = false;
    this.players = Array(9).fill(null);
    this.inactivePlayers = [];
    this.isStarted = false;
    this.currentPlayerIndex = 0;
    this.dealerIndex = 0;
    this.startGame();

    setInterval(() => {
      if(Math.random() < 0.2) {
          const bot = new BotPlayer('bot' + Math.random() * 100000);
          if (!this.checkTable()) {
            this.join(bot);  
          }
      }
      if(Math.random() < 0.02) {
        const bots = this.players.filter(it => it instanceof(BotPlayer));
        const bot = bots[Math.floor(Math.random() * bots.length)];
        if(bot) {
            this.leave(bot);
        }
      }
    }, 2000);
  }

  join(player: Player | BotPlayer | PlayerClient) {
    const emptyIndex = this.players.indexOf(null);  
    if (emptyIndex < 0) {
      console.log('Room is full');
      if (player instanceof Player) {
        this.inactivePlayers.push(player);
      }
      return 0;
    }
    if (player instanceof Player && this.players[0] && this.players.length > 2) {
      this.expectant = player;
    } else if (player instanceof Player && this.players[0] && this.players.length === 1) {
      this.players[0] = player;
    } else {
      this.players[emptyIndex] = player;
    }
    if (this.lastState) {
      player.handleMessage(this.lastState);
    } else if (!this.isStarted) {
      this.players.filter(player => player).forEach(player => {
        player.handleMessage({type: 'join', data: {players: this.players.map(player => player ? new PlayerState(true, true, player.name, 0) : new PlayerState(true, true, 'Empty', 0))}});
      })
    }
    if (!this.isStarted) {
      this.startGame();
    }
    return emptyIndex;
  }

  leave(player: Player | BotPlayer) {
    if (this.inactivePlayers.includes(player)) {
      this.inactivePlayers.splice(this.players.indexOf(player), 1);
    }
    if (this.players.includes(player)) {
      this.players.splice(this.players.indexOf(player), 1, null);
    }
    console.log('Update: ', this.players);
  }

  backToGame(player: Player) {
    if (this.inactivePlayers.includes(player)) {      
      this.inactivePlayers.splice(this.players.indexOf(player), 1);
      if (this.players[0]) {
        this.expectant = player;
      } else {
        this.players[0] = player;
      }
    }
  }

  startGame() {
    const activePlayers = this.players.filter(player => player);
    activePlayers.forEach(player => player.isOut = true);
    if (activePlayers.length < 2) {
      this.isStarted = false;
      activePlayers.forEach(player => player.isOut = false);
      return;
    }
    this.isStarted = true;
    const game = new GameLogic(this.players.map(player => player ?
                               new PlayerState(false, false, player.name, player.chips) :
                               new PlayerState(true, true, 'Empty', 0)), originDeck, this.dealerIndex);
    game.onMessage = (message: IGameMessage<any>) => {
      console.log('Message: ', message);
      switch (message.type) {
        case 'state':
        {
          this.lastState = message;
          this.handleMessage(message);
          // this.currentPlayerIndex = message.data.currentPlayerIndex;
          this.onMessage?.(message);
          break;}
        case 'ask':
        {
          const data: IDataAsk = message.data;
          const currentPlayerIndex = data.playerId;
          if (!this.players[currentPlayerIndex]) {
            return
          }
          let a = setTimeout(() => {
            if (data.actions.check) {
              data.actions.check();
            } else if (data.actions.fold) {
              data.actions.fold();
            }
            a = null;
          }, 5000)

          const q: IActions = {}
          Object.keys(data.actions).forEach((actionKey) => {
            q[actionKey as keyof IActions] = () => {
              if (a === null) return;
              clearTimeout(a);
              a = null;
            console.log("ChtoNibud", currentPlayerIndex);
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
            this.handleMessage(message);
            // alert('Finish');
            game.destroy();
            // this.leave(this.players[Math.floor(Math.random() * this.players.length)]);

            this.players.forEach((player, i) => {
              if (player instanceof Player && player.isOut) {
                // this.leave(this.players[i]);
                const leftPlayer = this.players.splice(this.players.indexOf(player), 1, null)[0];
                leftPlayer.handleMessage({ type: 'leave', data: {}});
                this.inactivePlayers.push(leftPlayer);
              }
            })

            if (this.expectant) {
              this.players[0] = this.expectant;
              this.expectant = null;
            }

            this.dealerIndex = this.setDealerIndex((this.dealerIndex +  1) % this.players.length);
            this.isStarted = false;

            this.startGame();
            // setWinInfo(message.data);
            break;
          }
        case 'start': {
          this.handleMessage(message);
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

  handleMessage(message: IGameMessage) {
    this.players.forEach(player => player?.handleMessage(message));
    this.inactivePlayers.forEach(player => player?.handleMessage(message));
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