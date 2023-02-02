import React, { useEffect, useState } from 'react'
import Socket from './components/socket'
import { Poker } from './game/poker'
import { CreateRoom } from './CreateRoom/CreateRoom'
import { IRoom } from '../../interfaces/IRoom'

import { Pk } from "./game/pk";
import  Garage  from "./game/g";
import Game from './game/game';

export function App() {
  const [messages, setMessages] = useState<string[]>([])
  const [rooms, setRooms] = useState<Record<string, IRoom>>({})
  const [text, setText] = useState('')
  const [userName, setUserName] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentRoom, setCurrentRoom] = useState<null | string>(null)

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

  return (
    <div>
      {currentRoom && <h1>You Are in Room: {currentRoom}</h1>}
      {/* <h1>Hello World</h1>
      { messages.map((mes: string) => <p>{mes}</p>) }
      <input
        type='text'
        placeholder='nick name here'
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
          <h2>chat</h2>
          {messages.map((mes, i) => {
            console.log(mes)
            return <p key={i}>{mes}</p>
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
          })
        }}
      >
        Send
      </button>
      <Poker></Poker>
      <button type="button" onClick={() => {
        socket.sendState(text);
      }}>Send</button> */}
      <Poker></Poker>
      {/* <Pk /> */}
      {/* <Garage /> */}
      {/* <Game /> */}
    </div>
  )
}
