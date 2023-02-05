import Socket from '../components/socket';
import { IActions, IGameMessage } from '../interfaces'

export class SocketLogic {
  onMessage: (msg: IGameMessage) => void
  socket: Socket;
  currentRoom: string;
  //onResponse: (msg: any) => void

  constructor(socket:Socket, currentRoom: string) {
    this.socket = socket;
    this.socket.onPokerResponse = (res)=>{
      this.handleMessage(res);
    }
    this.currentRoom = currentRoom;
  }

  handleMessage(message: any) {
    switch (message.type) {
      case 'state': {  
        this.onMessage(message) 
        
        break;
      }
      case 'ask': {
        this.onMessage({
          ...message,
            data: {...message.data,
            actions: this.getActions(message.data.actions)
          }
          
        })
      }
    }
  }

  private getActions(names: string[]) {
    const actions: IActions = {};
    names.forEach(name => {
      actions[name as keyof IActions] = ()=>this.action(name)
    })
    return actions;
  }

  private action(name: string) {
    this.socket.sendState({
      type: 'poker',
      roomName: this.currentRoom,
      data:{
        action: name
      }
      
    })
  }

  destroy() {
    
  }
}

/* import { IGameMessage } from '../interfaces' */
/**/
/* export class SocketLogic { */
/*   onMessage: (msg: IGameMessage) => void */
/*   onResponse: (msg: any) => void */
/**/
/*   constructor() { */
/**/
/*   } */
/**/
/*   handleMessage(message: any) { */
/*     switch (message.type) { */
/*       case 'state': {   */
/*         this.onMessage(message.data)  */
/*          */
/*         break; */
/*       } */
/*       case 'ask': { */
/*         this.onMessage({ */
/*           ...message.data, */
/*           actions: this.getActions(message.data.actions) */
/*         }) */
/*       } */
/*     } */
/*   } */
/**/
/*   private getActions(names: string[]) { */
/*     return names.map(name => { */
/*       return this.action(name) */
/*     }) */
/*   } */
/**/
/*   private action(name: string) { */
/*     this.onResponse({ */
/*       action: name */
/*     }) */
/*   } */
/**/
/*   destroy() { */
/*      */
/*   } */
/* } */
