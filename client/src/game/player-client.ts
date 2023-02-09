import { Player } from './players';
import Socket from "../components/socket";
import { IGameMessage, IActions } from '../interfaces';

export class PlayerClient extends Player{
  socket: Socket;
  currentRoom: string;
  constructor(name: string, socket:Socket, currentRoom: string){
    super(name);
    this.socket = socket;
    this.currentRoom = currentRoom;
    socket.onPokerResponse = (msg) => {
      this.handleMessage(msg);
      console.log(msg);
    }
  }

  handleMessage(message: IGameMessage) {
    if (message.type === "ask") {
      console.log('Player message: ', message);
    const getActions = (names: string[]) => {
      const actions: IActions = {};
      names.forEach(name => {
        actions[name as keyof IActions] = ()=> action(name)
      })
      return actions;
    }        
    
  
    const action = (name: string) => {
      this.socket.sendState({
        type: 'poker',
        roomName: this.currentRoom,
        data:{
          type: 'move',
          data:{
            action: name
          }
        }
      })
    }
           
    const m = {
      ...message,
        data: {...message.data,
        actions: getActions(message.data.actions)
      }              
    }
    
      this.onMessage(m);
    } else {
      this.onMessage(message)
    }
  }
}