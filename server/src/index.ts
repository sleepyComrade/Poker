import * as webSocket from 'websocket'
import { connection } from 'websocket'
import { Room } from './room2'
import * as http from 'http'
import { IRoomServer } from './interfaces/IRoomServer'
import { Player } from './player'
import { UserService } from './user-service';
import {createIdGenerator} from "../../client/src/components/id-generator"
import * as path from "path"
import * as fs from "fs"

const WebSocketServer = webSocket.server
const port = process.env.PORT || 4002
const userService = new UserService();

const rooms: Record<string, Room> = {}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/avatar")) {
    const avatar = req.url.slice(8)
    
    fs.promises.readdir(path.join(__dirname, "../", "public")).then(ls => {
      console.log(ls)
      if (!ls.includes(avatar + ".png")) {
        res.writeHead(404).end("not found")
        return
      }

      const stream = fs.createReadStream(path.join(__dirname, "../", "public", `${avatar}.png`))

      res.writeHead(200)

      stream.pipe(res)
        
    })
    console.log("!avatar", avatar, req.url)
    return
  }
  res.writeHead(404)

  res.end("not found")
})

server.listen(port, () => {
  console.log(new Date() + ` Server is listening on port ${port}`)
})

const socket = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
  maxReceivedFrameSize: 1000000,
})

const connections: connection[] = []

socket.on('request', (request) => {
  const connection = request.accept(undefined, request.origin)
  connections.push(connection)
  console.log(new Date() + ' Connection accepted.')

  connection.on('message', (message) => {
    console.log("Message")
    if (message.type === "binary") {
      // console.log(message.binaryData.toString("utf8"))
      fs.promises.writeFile(path.join(__dirname, "../", "public", "test.png"), new DataView(message.binaryData.buffer))
      console.log(message.binaryData)
    }
    if (message.type === 'utf8') {
      const parsed = JSON.parse(message.utf8Data)

      if (!('type' in parsed)) {
        return
      }

      const currentUser = userService.getUserByConnection(connection);
      if (currentUser && currentUser.connection !== connection) {
        throw new Error("!!!!!!!!!!!!!!!!!!!!!!!!!!sdfsdgsdf!!");
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

      const checkRoom = ()=>{
        if (!rooms[parsed.roomName]) {
          connection.sendUTF(JSON.stringify({
            type: "privateMessage",
            requestId: parsed.requestId,
            data: {
              succes: false,
              statusText: "There is no room with such name"
            }
          }))
          return false;
        }
        return true;
      }

      if (parsed.type === 'gameStart') {
        if (!checkRoom()) return;
        console.log(`game start in room ${parsed.roomName}`)
        rooms[parsed.roomName].startGame()
      }

      if (parsed.type === "poker") {
        if (!checkRoom()) return;
        console.log(parsed.roomName, parsed);
        rooms[parsed.roomName ].handleMessage(currentUser, parsed.data, parsed.requestId)
      }

      if (parsed.type === "user") {
        console.log(parsed);
        userService.handleMessage(connection, parsed.data, parsed.requestId);
      }

      if (parsed.type === "bonus") {
        console.log(parsed);
        userService.handleMessage(connection, parsed.data, parsed.requestId);
      }

      if (parsed.type === "userAvatar") {
        const buffer = Buffer.from(parsed.data.img, "base64")
        fs.promises.writeFile(path.join(__dirname, "../", "public", `${currentUser.userName}.png`), buffer).then(() => {
          currentUser.changeAvatar(`http://localhost:4002/avatar/${currentUser.userName}`)
        })
      }
    }
  })

  connection.on('close', (reasonCode, description) => {
    console.log('Close!!!!', description);
    
    userService.handleDisconnect(connection);
    connections.splice(connections.indexOf(connection), 1)
    Object.values(rooms).forEach(room => {
      room.handleDisconnect(connection)
    })
    console.log(
      new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.'
    )
  })
})
