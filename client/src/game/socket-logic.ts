import { IGameMessage } from '../interfaces'

export class SocketLogic {
  onMessage: (msg: IGameMessage) => void
  onResponse: (msg: any) => void

  constructor() {

  }

  handleMessage(message: any) {
    switch (message.type) {
      case 'state': {  
        this.onMessage(message.data) 
        
        break;
      }
      case 'ask': {
        this.onMessage({
          ...message.data,
          actions: this.getActions(message.data.actions)
        })
      }
    }
  }

  private getActions(names: string[]) {
    return names.map(name => {
      return this.action(name)
    })
  }

  private action(name: string) {
    this.onResponse({
      action: name
    })
  }

  destroy() {
    
  }
}
