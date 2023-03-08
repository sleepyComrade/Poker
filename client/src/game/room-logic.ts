import { GameLogic } from './game-logic';
import { IActions, IGameMessage, IDataAsk, IDataWinner } from '../interfaces';
import { Player, BotPlayer, PlayerState } from './players';
import { PlayerClient } from './player-client';
import { IMessage } from '../interfaces/IMessage';
import { moveTime, delayBetweenRounds } from "../const";

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
  messages: IMessage[]
  name: string;

  constructor(name: string = '_local') {
    this.name = name;
    this.messages = []
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
      if (Math.random() < 0.2) {
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
          if (this.players.filter(player => player).length < this.players.length - 1) {
            this.join(bot);
          }
        }
      }
      if (Math.random() < 0.1) {
        const bots = this.players.filter(it => it instanceof (BotPlayer));
        const bot = bots[Math.floor(Math.random() * bots.length)];
        if (bot) {
          this.leave(bot);
        }
      }
    }, 2000);
  }

  getCurrentState() {
    return {
      roomPlayers: this.players.map(player => player && new PlayerState(false, false, player.name, player.chips)),
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

    this.handleMessage({ type: 'roomState', data: this.getCurrentState() });
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
      player.handleMessage({ type: 'leave', data: {} });
    }
    console.log('Update: ', this.players);
    this.handleMessage({ type: 'roomState', data: this.getCurrentState() });
  }

  backToGame(player: Player) {
    // if (this.inactivePlayers.includes(player)) {      
    //   this.expectant = this.inactivePlayers.splice(this.players.indexOf(player), 1)[0];
    // }
  }

  startGame() {
    console.log('Players!!!!!!!', this.inactivePlayers);

    const activePlayers = this.players.filter(player => player);
    activePlayers.forEach(player => player.isOut = true);
    if (activePlayers.length < 2) {
      this.isStarted = false;
      this.handleMessage({ type: 'roomState', data: this.getCurrentState() })
      activePlayers.forEach(player => player.isOut = false);
      return;
    }
    this.isStarted = true;
    this.handleMessage({ type: 'roomState', data: this.getCurrentState() })
    const game = new GameLogic(this.players.map(player => player ?
      new PlayerState(false, false, player.name, player.chips) :
      new PlayerState(true, true, 'Empty', 0)), this.dealerIndex);
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
            break;
          }
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
            }, moveTime)

            const q: IActions = {}
            Object.keys(data.actions).forEach((actionKey) => {
              q[actionKey as keyof IActions] = (...args: any) => {
                if (a === null) return;
                clearTimeout(a);
                a = null;
                console.log("ChtoNibud", currentPlayerIndex);
                if (this.players[currentPlayerIndex]) {
                  this.players[currentPlayerIndex].isOut = false;
                  message.data.actions[actionKey](...args);
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
                player?.handleMessage({ type: 'askOther', data: { playerId: currentPlayerIndex } });
              }
            });
            this.inactivePlayers.forEach(player => {
              player?.handleMessage({ type: 'askOther', data: { playerId: currentPlayerIndex } });
            })
            // if (this.expectant) {
            //   this.expectant.handleMessage({ type: 'askOther', data: { playerId: currentPlayerIndex }});
            // }
            this.onMessage?.(message);
            break;
          }
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
            if (winData.winners) {
              winData.winners.forEach(winner => {
                if (this.players[winner.winIndex]) {
                  this.players[winner.winIndex].chips += winner.count;
                } else {
                  console.log('Winner left');
                }
              })
            } else {
              if (this.players[winData.winIndex]) {
                this.players[winData.winIndex].chips += winData.count;
              } else {
                console.log('Winner left');
              }
            }

            setTimeout(() => {
              game.destroy();

              this.playersToLeave.forEach(player => {
                this.players.splice(this.players.indexOf(player), 1, null);
              })
              this.playersToLeave = [];

              this.players.forEach((player, i) => {
                if (player && ((player.chips < 100) || player.isOut)) {
                  const leftPlayer = this.players.splice(this.players.indexOf(player), 1, null)[0];
                  leftPlayer.handleMessage({ type: 'leave', data: {} });
                  if (leftPlayer instanceof Player) {
                    console.log("Moved to inactive");
                    this.inactivePlayers.push(leftPlayer);
                  }
                }
              })


              // if (this.expectant) {
              //   this.players[0] = this.expectant;
              //   this.players[0].handleMessage({type: 'get back', data: {}});
              //   this.expectant = null;
              // }              
              if (this.players.filter(player => player).length >= 1) {
                this.dealerIndex = this.setDealerIndex((this.dealerIndex + 1) % this.players.length);
              }
              this.isStarted = false;
              this.game = null;
              this.startGame();
            }, delayBetweenRounds);

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
    const getNextIndex = (cur: number) => (cur + 1) % this.players.length;
    const getNewInitialIndex = (last: number): number => !this.players[getNextIndex(last)] ?
      getNewInitialIndex(getNextIndex(last)) :
      getNextIndex(last);
    return !this.players[curIndex] ? getNewInitialIndex(curIndex) : curIndex;
  }

  handleChatMessage(message: IMessage) {
    this.messages.push(message);
    console.log("thisChatMessages", this.messages)
    this.players.forEach(player => {
      player?.handleMessage({
        type: "chatMessages",
        data: {
          roomId: this.name,
          playerUID: player.id,
          messages: this.messages
        }
      })
    })
  }

  checkTable() {
    return this.players.every(player => player);
  }

  takeSit(userName: string, index: number) {
    const playerIndex = this.inactivePlayers.findIndex(player => player.name === userName);
    if (playerIndex >= 0) {
      this.players.splice(index, 1, this.inactivePlayers.splice(playerIndex, 1)[0]);
      this.players[index].isOut = false;
      this.players[index].chips = 5000;
    }
  }

  destroy() {

  }
}
