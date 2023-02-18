import { GameLogic } from './game-logic';
import { IActions, IGameMessage, IDataAsk, IDataWinner } from '../interfaces';
import { originDeck } from './players-and-deck';
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
  // expectants: Player | BotPlayer[];
  playersToLeave: BotPlayer[];
  botNames: string[];
  game: GameLogic;
  name: string;
  constructor(name: string = '_local') {
    this.name = name;
    this.condition = false;
    this.players = Array(9).fill(null);
    this.inactivePlayers = [];
    this.playersToLeave = [];
    // this.expectants = [];
    this.isStarted = false;
    this.currentPlayerIndex = 0;
    this.dealerIndex = 0;
    this.botNames = ['James Bot', 'Botman', 'Bad Bot', 'roBot', 'BroBot', 'Bothead', 'Botzilla', 'Bottenstein', 'Bot3000', 'Botty McBot', 'Botzy', 'Botlet', 'Botburst', 'Botzap', 'Botilliant', 'Botivator', 'Botronaut', 'Botomize'];
    this.startGame();    

    setInterval(() => {
      if(Math.random() < 0.2) {
        const getBotName = () => {
          let name = this.botNames[Math.floor(Math.random() * this.botNames.length)];
          if (this.players.map(player => player ? player.name : null).includes(name)) {
            name = getBotName();
          }
          return name;
        };
        const botName = getBotName();
        const bot = new BotPlayer(botName ? botName : 'Bot');
        if (!this.checkTable()) {
          this.join(bot);  
        }
      }
      if(Math.random() < 0.1) {
        const bots = this.players.filter(it => it instanceof(BotPlayer));
        const bot = bots[Math.floor(Math.random() * bots.length)];
        if(bot) {
            this.leave(bot);
        }
      }
    }, 2000);
  }

  // join(player: Player | BotPlayer | PlayerClient) {
  //   // if (this.expectant === player || this.inactivePlayers.includes(player) || this.players.includes(player)) {
  //     // return 0;
  //   // }
  //   const emptyIndex = this.players.indexOf(null);  
  //   if (emptyIndex < 0) {
  //     console.log('Room is full');
  //     if (player instanceof Player) {
  //       // this.expectant = player;
  //       // this.expectant.handleMessage({type: 'wait', data: {}});
  //     }
  //     return 0;
  //   }
  //   if (player instanceof Player && this.players[0] && this.players.length > 2) {
  //     // this.expectant = player;
  //     // this.expectant.handleMessage({type: 'wait', data: {}});
  //   } else if (player instanceof Player && this.players[0] && this.players.length === 1 ||
  //              !this.players[0]) {
  //     this.players[0] = player;
  //   } else {
  //     this.players[emptyIndex] = player;
  //   }
  //   if (this.lastState) {
  //     player.handleMessage(this.lastState);
  //   } else if (!this.isStarted) {
  //     this.players.filter(player => player).forEach(player => {
  //       player.handleMessage({type: 'join', data: {players: this.players.map(player => player ? new PlayerState(true, true, player.name, 0) : new PlayerState(true, true, 'Empty', 0))}});
  //     })
  //   }
  //   if (!this.isStarted) {
  //     this.startGame();
  //   }
  //   return emptyIndex;
  // }

  getCurrentState(){
    return {
      roomPlayers: this.players.map(player=> player && new PlayerState(false, false, player.name, player.chips)),
      gameState: this.game ? this.game.getState() : null,
      isStarted: this.isStarted
    }
  }

  join(player: Player | BotPlayer) {
    player.currentRoom = this;
    //if (this.lastState) {
      
    //}
    const emptyIndex = this.players.indexOf(null);
    if (emptyIndex < 0) {
      console.log('Room is full');
      this.inactivePlayers.push(player);
      return 9;
    }
    this.players[emptyIndex] = player;

    this.handleMessage({type: 'roomState', data: this.getCurrentState()});
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
      this.playersToLeave.push(player);
    } else {
      player.handleMessage({ type: 'leave', data: {}});
    }
    console.log('Update: ', this.players);
    this.handleMessage({type: 'roomState', data: this.getCurrentState()});
  }

  backToGame(player: Player) {
    // if (this.inactivePlayers.includes(player)) {      
    //   this.expectant = this.inactivePlayers.splice(this.players.indexOf(player), 1)[0];
    // }
  }

  startGame() {
    const activePlayers = this.players.filter(player => player);
    activePlayers.forEach(player => player.isOut = true);
    if (activePlayers.length < 2) {
      this.isStarted = false;
      this.handleMessage({type: 'roomState', data: this.getCurrentState()})
      activePlayers.forEach(player => player.isOut = false);
      return;
    }
    this.isStarted = true;
    this.handleMessage({type: 'roomState', data: this.getCurrentState()})
    const game = new GameLogic(this.players.map(player => player ?
                               new PlayerState(false, false, player.name, player.chips) :
                               new PlayerState(true, true, 'Empty', 0)), originDeck, this.dealerIndex);
    this.game = game;
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
          // if (this.expectant) {
          //   this.expectant.handleMessage({ type: 'askOther', data: { playerId: currentPlayerIndex }});
          // }
          this.onMessage?.(message);
        break;}
        case 'winner':
          {
            this.handleMessage(message);
            const winData: IDataWinner = message.data;
            this.game.players.forEach((player, i) => {
              if (!player.isAbsent) {
                if (this.players[i]) {
                  this.players[i].chips = player.chips;
                } else {
                  console.log('Player left');
                }
              }
            })
            if (this.players[winData.winIndex]) {
              this.players[winData.winIndex].chips += winData.count;
            } else {
              console.log('Winner left');
            }
            setTimeout(()=>{
              game.destroy();

              this.playersToLeave.forEach(player => {
                this.players.splice(this.players.indexOf(player), 1, null);
                this.playersToLeave = [];
              })

              this.players.forEach((player, i) => {
                if (player instanceof Player && player.isOut) {
                  const leftPlayer = this.players.splice(this.players.indexOf(player), 1, null)[0];
                  leftPlayer.handleMessage({ type: 'leave', data: {}});
                  this.inactivePlayers.push(leftPlayer);
                }
              })

              // if (this.expectant) {
              //   this.players[0] = this.expectant;
              //   this.players[0].handleMessage({type: 'get back', data: {}});
              //   this.expectant = null;
              // }
              if (this.players.filter(player => player).length >= 1) {
                this.dealerIndex = this.setDealerIndex((this.dealerIndex +  1) % this.players.length);
              }
              this.isStarted = false;
              this.game = null;
              this.startGame();
            }, 3000);
            
            break;
          }
        case 'start': {
          this.handleMessage(message);
          this.onMessage?.(message);
        }
        case "chatMesage": {
          
        }
        default:
          break;
      }
      console.log('Id: ', message.data.playerId);
    }
  }

  handleMessage(message: IGameMessage<any>) {
    this.players.forEach(player => player?.handleMessage(message));
    this.inactivePlayers.forEach(player => player?.handleMessage(message));
    // if (this.expectant) {
    //   this.expectant.handleMessage(message);
    // }
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
