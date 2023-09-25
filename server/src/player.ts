import { connection } from 'websocket'
import { IPlayer, ICard } from '../../client/src/interfaces'

export class Player {
  nickname: string
  socketConnection: connection

  constructor(socketConnection: connection, nickname: string) {
    this.socketConnection = socketConnection
    this.nickname = nickname
  }
}
