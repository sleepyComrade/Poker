import { IRoomServer } from './interfaces/IRoomServer'
import { Player } from './player'
import { GameLogic } from '../../client/src/game/game-logic'
import { ICard, IPlayer } from '../../client/src/interfaces'

export class Room implements IRoomServer {
  players: Record<string, Player>
  messages: string[]
  isStarted: boolean
  currentPlayerIndex: number
  gameLogic: GameLogic

  constructor(public name: string) {
    const myPlayerIndex = 0

    this.currentPlayerIndex = 0
    this.players = {}
    this.messages = []
    const originDeck: ICard[] = []
    for (let i = 1; i <= 4; i++) {
      for (let j = 1; j <= 13; j++) {
        originDeck.push({
          type: i,
          value: j,
        })
      }
    }

    const testPlayers: IPlayer[] = [
      {
        name: 'Player1',
        cards: [],
      },
      {
        name: 'Player2',
        cards: [],
      },
      {
        name: 'Player3',
        cards: [],
      },
      {
        name: 'Player4',
        cards: [],
      },
      {
        name: 'Player5',
        cards: [],
      },
      {
        name: 'Player6',
        cards: [],
      },
      {
        name: 'Player7',
        cards: [],
      },
      {
        name: 'Player8',
        cards: [],
      },
    ].map((player) => ({ ...player, isFold: false, chips: 10000, bet: 0, isAllIn: false }))
    this.gameLogic = new GameLogic(testPlayers, originDeck)
    this.gameLogic.onMessage = (message) => {
      console.log(message)
      switch (message.type) {
        case 'state': {
          // setPlayers(message.data.players);
          // setPot(message.data.pot);
          // setTableCards(message.data.tableCards);
          // setCurrentPlayerIndex(message.data.currentPlayerIndex);
          break
        }
        case 'ask': {
          const currentPlayerIndex = message.data.playerId
          const setBotChoise = () => {
            const actions1 = message.data.actions
            console.log(actions1)
            const num = Math.floor(Math.random() * Object.keys(actions1).length)
            const method = Object.keys(actions1)[num] as keyof typeof actions1
            actions1[method]()
          }
          console.log(currentPlayerIndex)
          // const myPlayerIndex = 0;
          // my player index === real player

          if (currentPlayerIndex !== myPlayerIndex) {
            // setActions({});
            // if (!players[currentPlayerIndex].isFold) {
            setTimeout(() => {
              setBotChoise()
            }, 1000)
            // } else {
            // setCurrentPlayerIndex(last => (last + 1) % players.length);
            // }
          }
          // else if (players[currentPlayerIndex].isFold) {
          //   setActions({});
          //   // setCurrentPlayerIndex(last => (last + 1) % players.length);
          // }
          else {
            // setActions(message.data.actions);
            // send to client
          }
          break
        }

        default:
          break
      }
    }
  }

  turnChange(): void {
    const playersKeys = Object.keys(this.players)
    this.players[playersKeys[this.currentPlayerIndex]].socketConnection.send(
      JSON.stringify({ type: 'turn', isPlayerTurn: true })
    )
    setTimeout(() => {
      console.log('player timout')
      this.players[playersKeys[this.currentPlayerIndex]].socketConnection.send(
        JSON.stringify({
          type: 'turn',
          isPlayerTurn: false,
        })
      )
      if (this.currentPlayerIndex !== playersKeys.length) {
        this.currentPlayerIndex++
        this.turnChange()
        return
      }

      this.isStarted = false
      Object.keys(this.players).forEach((key) => {
        const player = this.players[key]
        player.socketConnection.sendUTF(JSON.stringify({ type: 'gameEnd' }))
      })
      this.currentPlayerIndex = 0
    }, 10000)
  }

  handleMessage(data: any) {
    console.log(data)
  }

  public startGame(): void {
    if (this.isStarted) {
      return
    }
    this.turnChange()
    this.isStarted = true
  }
}
