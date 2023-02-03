import * as webSocket from 'websocket'
import { connection } from 'websocket'
import { Room } from './room'
import * as http from 'http'
import { IRoomServer } from './interfaces/IRoomServer'
import { Player } from './player'

const WebSocketServer = webSocket.server
const port = 4002

const rooms: Record<string, IRoomServer> = {}

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type',
  })

  console.log('reqeust', req.url, req.method)
  if (req.method === 'GET' && req.url === '/rooms') {
    console.log('rooms request')
    res.end(JSON.stringify(Object.keys(rooms)))
  }
})

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

      if (!('type' in parsed)) {
        return
      }

      console.log(parsed.type)
      if (parsed.type === 'createRoom') {
        console.log('Room Create Request')
        if (rooms[parsed.roomName]) {
          return
        }
        rooms[parsed.roomName] = new Room(parsed.roomName)
        const roomsToSend = structuredClone(rooms)
        Object.keys(roomsToSend).forEach((key) => {
          delete roomsToSend[key].startGame
          delete roomsToSend[key].players
        })
        connections.forEach((connection) => {
          connection.sendUTF(
            JSON.stringify({ type: 'createRoom', rooms: roomsToSend })
          )
        })
        console.log('create Room; rooms now:', rooms)
      }

      if (parsed.type === 'chatMessage') {
        if (!rooms[parsed.room]) {
          return
        }

        rooms[parsed.room].messages.push(parsed.data)

        console.log('on message', rooms[parsed.room])
        Object.keys(rooms[parsed.room].players).forEach((key) => {
          console.log('Player to send', key)
          rooms[parsed.room].players[key].socketConnection.sendUTF(
            JSON.stringify({
              type: 'chatMessage',
              message: parsed.data,
              author: parsed.author,
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
          console.log(rooms[parsed.roomName])
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

      if (parsed.type === 'gameStart') {
        console.log(`game start in room ${parsed.roomName}`)
        if (!rooms[parsed.roomName]) {
          connection.send(
            JSON.stringify({
              type: 'error',
              errortext: 'There is no such room',
            })
          )
          return
        }

        rooms[parsed.roomName].startGame()
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
