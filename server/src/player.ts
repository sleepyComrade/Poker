import { connection } from 'websocket'

export class Player {
  nickname: string
  socketConnection: connection

  constructor(socketConnection: connection, nickname: string) {
    this.socketConnection = socketConnection
    this.nickname = nickname
  }
}
