import { IRoom } from '../../../interfaces/IRoom'
import { Player } from '../player'

export interface IRoomServer extends IRoom {
  players: Record<string, Player>
}
