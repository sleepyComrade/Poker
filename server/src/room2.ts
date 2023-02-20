import { IRoomServer } from './interfaces/IRoomServer'
// import { Player } from './player'
import { GameLogic } from '../../client/src/game/game-logic'
import { IActions, ICard, IPlayer } from '../../client/src/interfaces'
import { connection } from "websocket"
import { RoomLogic } from '../../client/src/game/room-logic';
import { Player, BotPlayer } from '../../client/src/game/players';
import { IMessage } from '../../client/src/interfaces/IMessage';
import { User } from './user';

export class Room {
    roomLogic: RoomLogic
    players: Map<connection, Player | BotPlayer> = new Map()
    lastActions: IActions = null;
    lastPlayer: Player = null;

    constructor(public name: string) {
        this.roomLogic = new RoomLogic(name);
        // setInterval(() => {
        //     if(Math.random() < 0.02) {
        //         const bot = new BotPlayer('bot' + Math.random() * 100000);
        //         if (!this.roomLogic.checkTable()) {
        //           this.roomLogic.join(bot);  
        //         }
        //     }
        //     if(Math.random() < 0.02) {
        //         const bot = [...this.players.values()].filter(it => it instanceof(BotPlayer))[0];
        //         if(bot) {
        //             this.roomLogic.leave(bot);
        //         }
        //     }
        // }, 2000);    
    }

    startGame(): void {
        throw new Error('Method not implemented.')
    }
    handleMessage(currentUser: User, msg: any, reqId?: string) {
        if (!currentUser) {
            return;
        }
        switch (msg.type) {
            case "join": {
                const player = new Player(currentUser.userName);
                player.onMessage = (playerMessage) => {
                    switch (playerMessage.type) {
                        case 'ask':
                            this.lastActions = playerMessage.data.actions;
                            this.lastPlayer = player;
                            currentUser.connection.sendUTF(JSON.stringify({
                                type: 'pocker',
                                data: {
                                    ...playerMessage,
                                    data: {
                                        ...playerMessage.data,
                                        actions: Object.keys(playerMessage.data.actions)
                                    }
                                }
                            }));
                            break;
                        case 'leave':
                            currentUser.plusChips(player.chips);
                            player.chips = 0;
                            currentUser.connection.sendUTF(JSON.stringify({
                                type: 'pocker',
                                data: {
                                    ...playerMessage
                                }
                            }));
                            break;

                        default:
                            currentUser.connection.sendUTF(JSON.stringify({
                                type: 'pocker',
                                data: {
                                    ...playerMessage
                                }
                            }));
                            break;
                    }
                }
                const playerIndex = this.roomLogic.join(player);
                if (playerIndex !== 9) {
                    currentUser.minusChips(5000);
                    player.chips = 5000;
                }
                this.players.set(currentUser.connection, player);
                console.log("MSG JOIN", msg, "reqID", reqId);
                currentUser.connection.sendUTF(JSON.stringify({
                    type: 'privateMessage',
                    requestId: reqId,
                    data: {
                        type: "join",
                        playerIndex: playerIndex,
                        roomName: this.name,
                        succes: true,
                        playerUID: player.id
                    }
                }))
                break;
            }
            case "leave": {
                const currentPlayer = this.players.get(currentUser.connection);
                if (currentPlayer) {
                    // this.roomLogic.leave(currentPlayer);
                    currentPlayer.leave();
                    this.players.delete(currentUser.connection);
                    currentUser.connection.sendUTF(JSON.stringify({
                        type: 'privateMessage',
                        requestId: reqId,
                        data: {
                            type: "leave",
                            roomName: this.name,
                            succes: true,
                            playerUID: currentPlayer.id
                        }
                    }))
                    currentUser.plusChips(currentPlayer.chips);
                    currentPlayer.chips = 0;
                } else {
                    console.log('player is inactive!!!!!!');
                }
                // this.lastActions = null;
                // this.lastPlayer = null;
                break;
            }
            case "move": {
                const currentPlayer = this.players.get(currentUser.connection);
                if (currentPlayer == this.lastPlayer) {
                    this.lastActions[msg.data.action as keyof IActions]();
                    // this.lastActions = null;
                    // this.lastPlayer = null;
                } else {
                    console.log('Wrong Player', currentPlayer, this.lastPlayer);
                }
                break;
            }
            case "roomState": {
                currentUser.connection.sendUTF(JSON.stringify({
                    type: 'privateMessage',
                    // requestId: "HelloWorld",
                    data: {
                        data: {
                            type: "roomState",
                            data: this.roomLogic.getCurrentState()
                        },
                        requestId: reqId,
                        type: "roomState",
                        roomName: this.name,
                        succes: true
                    }
                }))
                break;
            }
            case "chatMessage": {
                // this.messages.push(msg.message)
                // this.players.forEach((player, connection) => {
                //     console.log("try send message")
                //     connection.send(JSON.stringify({
                //         type: "pocker",                       
                //         data: {
                //             type: "chatMessage",
                //             roomName: this.name,                            
                //             data: { 
                //                 messages: this.messages,
                //                 roomId: this.name,
                //                 playerUID: player.id,
                //              },
                //         }
                //     }))
                // })
                // this.roomLogic.messages.push(msg.message)
                // this.players.forEach((player, connection) => {
                //     connection.send(JSON.stringify({
                //         type: "pocker",
                //         data: {
                //             type: "chatMessage",
                //             data: {messages: this.roomLogic.messages},
                //         }
                //     }))
                // })
                this.roomLogic.handleChatMessage(msg.message)
                break
            }
            case "getChatHistory": {
                currentUser.connection.sendUTF(JSON.stringify({
                    type: "privateMessage",
                    requestId: reqId,
                    data: {
                        // roomId: this.name,
                        // playerUID: .id,
                        messages: this.roomLogic.messages,
                    }
                }))
            }
        }
    }
    handleDisconnect(connection: connection) {
        const currentPlayer = this.players.get(connection);
        if (currentPlayer) {
            this.roomLogic.leave(currentPlayer);
            this.players.delete(connection);
        }
        // this.lastActions = null;
        // this.lastPlayer = null;
    }
}
