import { BotPlayer, Player } from "./players";
import {  } from "module";

export const controlBots = (roomLogic, players: (Player | BotPlayer)[]) => {
  setInterval(() => {
    if(Math.random() < 0.02) {
        const bot = new BotPlayer('bot' + Math.random() * 100000);
        if (!this.roomLogic.checkTable()) {
          this.roomLogic.join(bot);  
        }
    }
    if(Math.random() < 0.02) {
        const bot = [...this.players.values()].filter(it => it instanceof(BotPlayer))[0];
        if(bot) {
            this.roomLogic.leave(bot);
        }
    }
  }, 2000);  
}