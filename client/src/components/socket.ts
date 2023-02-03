import { IRoom } from '../../../interfaces/IRoom'
import { IMessage } from '../interfaces/IMessage'

export default class Socket {
  webSocket: WebSocket

  onMessage: (message: IMessage) => void
  onRoomCreate: (rooms: Record<string, IRoom>) => void

  constructor() {
    this.webSocket = new WebSocket('ws://localhost:4002/')
    this.webSocket.onmessage = (message) => {
      console.log(message)
      const parsedData = JSON.parse(message.data)
      if (parsedData.type === 'chatMessage') {
        console.log('recevied chatMessage: ', message)
        this.onMessage({
          message: parsedData.message,
          author: parsedData.author,
        })
      }
      if (parsedData.type === 'createRoom') {
        console.log('room create')
        console.log('room name', parsedData.roomName)
        this.onRoomCreate(parsedData.rooms)
      }
    }
    this.webSocket.onopen = () => {
      console.log('open')
    }
    this.webSocket.onclose = () => {
      console.log('close')
    }
  }

  sendState(state: Record<string, any>) {
    this.webSocket.send(JSON.stringify(state))
  }

  destroy() {
    this.webSocket.close()
  }
}
