import * as webSocket from 'websocket'
import { connection } from 'websocket'
import { Room } from './room2'
import * as http from 'http'
import { IRoomServer } from './interfaces/IRoomServer'
import { Player } from './player'
import { UserService } from './user-service';

const WebSocketServer = webSocket.server
const port = process.env.PORT || 4002
const userService = new UserService();

const rooms: Record<string, Room> = {}

const server = http.createServer((req, res) => {
  res.end("HelloWorld")
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
        connections.forEach((connection) => {
          connection.sendUTF(
            JSON.stringify({ type: 'createRoom', rooms: Object.keys(rooms) })
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
          // rooms[parsed.room].players[key].socketConnection.sendUTF(
          //   JSON.stringify({
          //     type: 'chatMessage',
          //     message: parsed.data,
          //     author: parsed.author,
          //   })
          // )
        })
      }

      if (parsed.type === "getRooms") {
        console.log("Get Rooms")
        connection.sendUTF(JSON.stringify({
          type: "privateMessage",
          requestId: parsed.requestId,
          data: {
            rooms: Object.keys(rooms)
          }
        }))
      }

      // if (parsed.type === 'connect') {
      //   console.log('connect request')
      //   console.log(
      //     `User Name: ${parsed.userName} room Name: ${parsed.roomName}`
      //   )
      //   if (rooms[parsed.roomName]) {
      //     console.log(rooms[parsed.roomName])
      //     if (rooms[parsed.roomName].players[parsed.userName]) {
      //       return
      //     }
      //     rooms[parsed.roomName].players[parsed.userName] = new Player(
      //       connection,
      //       parsed.userName
      //     )
      //     Object.values(rooms[parsed.roomName].players).forEach(player => {
      //       player.socketConnection.sendUTF(JSON.stringify({type: "roomStateConnections", connections: Object.keys(rooms[parsed.roomName].players)}))
      //     })
      //     console.log(rooms)
          
      //   }
      // }

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

      if (parsed.type === "poker") {
        console.log(parsed.roomName, parsed);
        rooms[parsed.roomName ].handleMessage(connection, parsed.data, parsed.requestId)
      }

      if (parsed.type === "user") {
        console.log(parsed);
        userService.handleMessage(connection, parsed.data, parsed.requestId);
      }

      if (parsed.type === "bonus") {
        console.log(parsed);
        userService.handleMessage(connection, parsed.data, parsed.requestId);
      }
    }
  })

  connection.on('close', (reasonCode, description) => {
    connections.splice(connections.indexOf(connection), 1)
    Object.values(rooms).forEach(room => {
      room.handleDisconnect(connection)
    })
    console.log(
      new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.'
    )
  })
})
