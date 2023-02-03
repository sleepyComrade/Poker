import React, { useEffect, useState } from 'react'
import Socket from './components/socket'
import { Poker } from './game/poker'
import { CreateRoom } from './CreateRoom/CreateRoom'
import { IRoom } from '../../interfaces/IRoom'
import { IMessage } from './interfaces/IMessage'

import { Pk } from './game/pk'
import Garage from './game/g'
import Game from './game/game'

export function App() {
  const [messages, setMessages] = useState<IMessage[]>([])
  const [rooms, setRooms] = useState<Record<string, IRoom>>({})
  const [text, setText] = useState('')
  const [userName, setUserName] = useState(Math.random().toString())
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentRoom, setCurrentRoom] = useState<null | string>(null)
  const [playerTurn, setPlayerTurn] = useState(false)

  useEffect(() => {
    const socket = new Socket()
    socket.onMessage = (message) => {
      console.log('message', message)
      setMessages((last) => [...last, message])
      console.log('messages:', messages)
    }
    socket.onRoomCreate = (rooms) => {
      setRooms(rooms)
      console.log(rooms)
    }
    setSocket(socket)
    return () => socket.destroy()
  }, [])

  useEffect(() => {
    console.log('try fetch')
    fetch('http://localhost:4002/rooms')
      .then((res) => res.json())
      .then((data) => {
        console.log('!!!!!!!!', data)
        setRooms(data)
      })
  }, [])

  return (
    <div>
      {currentRoom && <h1>You Are in Room: {currentRoom}</h1>}
      {playerTurn && <h1>Your Turn</h1>}
      <button
        onClick={() => {
          socket.sendState({ type: 'gameStart', roomName: currentRoom })
        }}
      >
        Start
      </button>
      <input
        type='text'
        placeholder={userName + ' (nickName)'}
        onChange={(e) => {
          setUserName(e.target.value)
        }}
      />
      <CreateRoom
        onSubmit={(roomName) => {
          socket.sendState({ type: 'createRoom', roomName: roomName })
        }}
      />
      <h2>Rooms</h2>
      {!currentRoom &&
        Object.keys(rooms).map((roomKey, i) => (
          <p
            key={i}
            onClick={() => {
              if (!userName) {
                return
              }
              setCurrentRoom(rooms[roomKey].name)
              socket.sendState({
                type: 'connect',
                roomName: rooms[roomKey].name,
                userName: userName,
              })
            }}
          >
            room {rooms[roomKey].name}
          </p>
        ))}
      {currentRoom && (
        <>
          <div>
            <button>1</button>
            <button>2</button>
          </div>
          <h2>chat</h2>
          {messages.map((messageData, i) => {
            return (
              <p key={i}>
                {messageData.author}: {messageData.message}
              </p>
            )
          })}
        </>
      )}
      <input
        type='text'
        value={text}
        onChange={(e) => {
          setText(e.target.value)
        }}
      />
      <button
        onClick={() => {
          socket.sendState({
            type: 'chatMessage',
            data: text,
            room: currentRoom,
            author: userName,
          })
        }}
      >
        Send
      </button>
      <Poker />
      {/* <Poker></Poker> */}
      {/* <Pk /> */}
      {/* <Garage /> */}
      {/* <Game /> */}
    </div>
  )
}
