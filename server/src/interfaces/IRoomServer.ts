import { IRoom } from '../../../interfaces/IRoom'
import { Player } from '../player'
import {connection} from "websocket"

export interface IRoomServer extends IRoom {
  players: Record<string, Player>
  startGame(): void
  handleMessage: (msg: any) => void
  handleDisconnect: (connection: connection) => void
}
