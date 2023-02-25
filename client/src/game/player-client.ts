import { Player } from './players';
import Socket from "../components/socket";
import { IGameMessage, IActions, IDataAsk } from '../interfaces';

export class PlayerClient extends Player{
  socket: Socket;
  currentRoomId: string;
  playerId: string;
  constructor(name: string, socket:Socket, currentRoom: string, playerId: string){
    super(name);
    this.playerId = playerId;
    this.socket = socket;
    this.currentRoomId = currentRoom;
    socket.onPokerResponse = (msg) => {
      if (msg?.data?.roomId != this.currentRoomId){ return; }
      if (msg?.data?.playerUID != this.playerId){ return; }
      this.handleMessage(msg);
      console.log(msg);
    }
  }

  handleMessage(message: IGameMessage<any>) {
    if (message.type === "ask") {
      console.log('Player message: ', message);
      const data: { actions: string[], playerId: number } = message.data;
      const getActions = (names: string[]) => {
        const actions: IActions = {};
        names.forEach(name => {
          actions[name as keyof IActions] = (count?: number)=> action(name, count)
        })
        return actions;
      }        
    
      const action = (name: string, count?: number) => {
        this.socket.sendState({
          type: 'poker',
          roomName: this.currentRoomId,
          data:{
            type: 'move',
            data:{
              action: name,
              count: count
            }
          }
        })
      }
             
      const m = {
        ...message,
          data: {...data,
          actions: getActions(data.actions)
        }              
      }
    
      this.onMessage(m);
    } else {
      this.onMessage(message)
    }
  }

  leave() {
    const res = this.socket.sendState({
      type: 'poker',
      roomName: this.currentRoomId,
      data: {
          type: 'leave',
          data: {
          }
      },
      userName: this.name,
    })

    return res.then((rs: any) => {
      return rs.data;
    });
  }

  getCurrentState(){
    const res = this.socket.sendState({
      type: 'poker',
      roomName: this.currentRoomId,
      data: {
          type: 'roomState',
          data: {
          }
      },
      userName: this.name,
    })

    return res.then((rs: any) => {
      return rs.data;
    });
  }

  sendChatMessage(message: string) {
    this.socket.sendState({
      type: "poker",
      roomName: this.currentRoomId,
      data: {
        type: "chatMessage",
        message: {
          author: this.name,
          message,
        },
      }
    })
  }
}
