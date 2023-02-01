import { IRoomServer } from './interfaces/IRoomServer'
import { Player } from './player'

export class Room implements IRoomServer {
  players: Record<string, Player>
  messages: string[]

  constructor(public name: string) {
    this.players = {}
    this.messages = []
  }
}
