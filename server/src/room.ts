import { IRoomServer } from './interfaces/IRoomServer'
import { Player } from './player'

export class Room implements IRoomServer {
  players: Record<string, Player>
  messages: string[]
  isStarted: boolean
  currentPlayerIndex: number

  constructor(public name: string) {
    this.players = {}
    this.messages = []
  }

  public startGame(): void {
    if (this.isStarted) {
      return
    }

    this.isStarted = true
    const playersKeys = Object.keys(this.players)
    console.log(playersKeys)
  }
}
