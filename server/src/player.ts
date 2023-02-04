import { connection } from 'websocket'
import { IPlayer, ICard } from '../../client/src/interfaces'

export class Player {
  nickname: string
  socketConnection: connection
  cards: ICard[]
  isFold: boolean
  chips: number
  bet: number

  constructor(socketConnection: connection, nickname: string) {
    this.socketConnection = socketConnection
    this.nickname = nickname
    this.cards = []
    this.isFold = false
    this.chips = 0
    this.bet = 0
  }
}
