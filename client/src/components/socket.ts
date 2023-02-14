import { IMessage } from '../interfaces/IMessage'
import { Signal } from "../common/signal"
import { IUserData } from '../../../interfaces/IUser'

const createIdGenerator = (pref: string) => {
  let id = 0;

  return () => {
    return pref + id++
  }
}

export default class Socket {
  webSocket: WebSocket

  private privateMessageSignal: Signal<Record<string, any>>
  onMessage: (messages: IMessage[]) => void
  onRoomCreate: (rooms: string[]) => void
  onTurn: (isPlayerTurn: boolean) => void
  onRoomConnectionsUpdate: (connections: string[]) => void
  nextReqId: () => string = createIdGenerator("socketReq") 
  onPokerResponse: (res:any) =>void;
  onRoomJoin: (res: { playerIndex: number, roomName: string, succes: boolean }) => void
  onChatMessage: (messages: IMessage[]) => void
  onConnect: () => void
  onUserUpdate: (userData: IUserData) => void;

  constructor() {
    this.privateMessageSignal = new Signal()
    // this.webSocket = new WebSocket('ws://rs-pocker-backend-production.up.railway.app:80/')
    this.webSocket = new WebSocket('ws://localhost:4002/')
    this.webSocket.onopen = () => {
      this.onConnect()
    }
    this.webSocket.onmessage = (message) => {
      console.log(message)
      const parsedData = JSON.parse(message.data)
      if (parsedData.type === 'chatMessage') {
        console.log('recevied chatMessage: ', message)
        this.onMessage(parsedData.data.messages)
      }
      if (parsedData.type === 'createRoom') {
        console.log('room create')
        console.log('room name', parsedData.roomName)
        this.onRoomCreate(parsedData.rooms)
      }
      if (parsedData.type === 'turn') {
        this.onTurn(parsedData.isPlayerTurn)
      }
      if (parsedData.type === "pocker") {
        // this.onPokerResponse(msg);
        if (parsedData?.data?.type === "join") {
          this.onRoomJoin(parsedData.data)
        }
        this.onPokerResponse(parsedData.data)
      }
      if (parsedData.type === "roomStateConnections") {
        this.onRoomConnectionsUpdate(parsedData.connections)
      }
      if (parsedData.type === "privateMessage") {
        this.privateMessageSignal.emit(parsedData)
      }
      if (parsedData.type === "userUpdate") {
        this.onUserUpdate(parsedData.data);
      }
    }
    this.webSocket.onclose = () => {
      console.log('close')
    }
  }

  sendState(state: Record<string, any>): Promise<Record<string, any>> {
    state.requestId = this.nextReqId()
    this.webSocket.send(JSON.stringify(state))

    const response = new Promise<Record<string, any>>(res => {
      const handler = (msg: any) => {
        if (msg.requestId === state.requestId) {
          this.privateMessageSignal.remove(handler)
          res(msg.data)
        }
      }

      this.privateMessageSignal.add(handler)
    })

    return response
  }

  destroy() {
    this.webSocket.close()
  }
}
