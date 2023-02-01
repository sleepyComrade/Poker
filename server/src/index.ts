import * as webSocket from 'websocket'
import { connection } from 'websocket'
import { Room } from './room'
import * as http from 'http'
import { IRoomServer } from './interfaces/IRoomServer'
import { Player } from './player'

const WebSocketServer = webSocket.server
const port = 4002

const rooms: Record<string, IRoomServer> = {}

const server = http.createServer((request, response) => {})

server.listen(port, () => {
  console.log(new Date() + ` Server is listening on port ${port}`)
})

const socket = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
})

const connections: connection[] = []

socket.on('request', (request) => {
  const connection = request.accept(undefined, request.origin)
  connections.push(connection)
  console.log(new Date() + ' Connection accepted.')

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      const parsed = JSON.parse(message.utf8Data)

      console.log('parsed', parsed)

      if (!('type' in parsed)) {
        return
      }

      console.log(parsed.type)
      if (parsed.type === 'createRoom') {
        console.log('Room Create Request')
        if (rooms[parsed.roomName]) {
          return
        }
        console.log('before', rooms)
        rooms[parsed.roomName] = new Room(parsed.roomName)
        const roomsToSend = JSON.parse(JSON.stringify(rooms))
        Object.keys(roomsToSend).forEach((key) => {
          delete roomsToSend[key].players
        })
        connections.forEach((connection) => {
          connection.sendUTF(
            JSON.stringify({ type: 'createRoom', rooms: roomsToSend })
          )
        })
      }

      if (parsed.type === 'chatMessage') {
        rooms[parsed.room].messages.push(parsed.data)

        if (!rooms[parsed.room]) {
          return
        }

        Object.keys(rooms[parsed.room].players).forEach((key) => {
          rooms[parsed.rooom].players[key].socketConnection.sendUTF(
            JSON.stringify({
              type: 'chatMessage',
              message: parsed.data,
              author: '',
            })
          )
        })
      }

      if (parsed.type === 'connect') {
        console.log('connect request')
        console.log(
          `User Name: ${parsed.userName} room Name: ${parsed.roomName}`
        )
        if (rooms[parsed.roomName]) {
          if (rooms[parsed.roomName].players[parsed.userName]) {
            return
          }
          rooms[parsed.roomName].players[parsed.userName] = new Player(
            connection,
            parsed.userName
          )
          console.log(rooms)
        }
      }
    }
  })

  connection.on('close', (reasonCode, description) => {
    connections.splice(connections.indexOf(connection), 1)
    console.log(
      new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.'
    )
  })
})
