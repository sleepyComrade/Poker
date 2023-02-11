import { IRoom } from '../../../interfaces/IRoom'
import { IMessage } from '../interfaces/IMessage'
import { SocketLogic } from '../game/socket-logic'

const createIdGenerator = (pref: string) => {
  let id = 0;

  return () => {
    return pref + id++
  }
}

export default class Socket {
  webSocket: WebSocket

  onMessage: (message: IMessage) => void
  onRoomCreate: (rooms: string[]) => void
  onTurn: (isPlayerTurn: boolean) => void
  onRoomConnectionsUpdate: (connections: string[]) => void
  onPrivateMessage: ((res: any) => void) | null
  nextReqId: () => string = createIdGenerator("socketReq") 
  onPokerResponse: (res:any) =>void;
  onRoomJoin: (res: { playerIndex: number, roomName: string, succes: boolean }) => void
  //socketLogic: SocketLogic

  constructor() {
    this.webSocket = new WebSocket('ws://localhost:4002/')
    /*this.socketLogic = new SocketLogic()
    this.socketLogic.onResponse = (msg) => {
      this.onPokerResponse({type: "poker", data: msg});
      //this.sendState({type: "poker", data: msg, roomName:})
    }*/
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
        console.log("PrivateRes", parsedData)
        this.onPrivateMessage && this.onPrivateMessage(parsedData.data)
      }
    }
    this.webSocket.onopen = () => {
      console.log('open')
    }
    this.webSocket.onclose = () => {
      console.log('close')
    }
  }

  sendState(state: Record<string, any>): Promise<Record<string, any>> {
    console.log(state)
    state.requestId = this.nextReqId()
    console.log("ReqID", state.requestId)
    this.webSocket.send(JSON.stringify(state))

    const response = new Promise<Record<string, any>>(res => {
      this.onPrivateMessage = (message: any) => {
        res(message)
      }
    })

    return response
  }

  destroy() {
    this.webSocket.close()
  }
}
