import { Signal } from "../common/signal"
import { IUserData } from '../../../interfaces/IUser'
import { createIdGenerator } from './id-generator';
import { socketUrl } from "../const";
import { IMessage } from "../../../interfaces/IMessage";

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
  onClose: () => void;

  constructor() {
    this.privateMessageSignal = new Signal()
    this.webSocket = new WebSocket(socketUrl)
    // this.webSocket.binaryType = "arraybuffer"
    this.webSocket.binaryType = "blob"
    this.webSocket.onopen = () => {
      this.onConnect()
    }
    this.webSocket.onerror = () => {
      console.log('Socket Error');
      this.onClose();
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
      this.onClose();
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

  sendBinaryState(state: Blob) {
    this.webSocket.send(state)
  }

  destroy() {
    this.webSocket.close()
  }
}
