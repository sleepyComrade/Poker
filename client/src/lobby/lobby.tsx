import React, { useEffect, useState } from "react";
import { CreateRoom } from './../CreateRoom/CreateRoom'
import Socket from './../components/socket'
import { IMessage } from '../interfaces/IMessage'
import '../style.css';
import './lobby.css';

type LobbyProps = {
    socket: Socket;
    rooms: Array<string>;
    players: Array<string>;
    messages: Array<IMessage>;
    userName: string;
    onUserName: (a: string) => void;
    onRoomEnter: (room: string) => void;
}

export default function Lobby({socket, rooms, players, messages, userName, onUserName, onRoomEnter}: LobbyProps) {
//   const [messages, setMessages] = useState<IMessage[]>([])
//   const [rooms, setRooms] = useState<string[]>([])
  const [text, setText] = useState('')
//   const [userName, setUserName] = useState(Math.random().toString())
//   const [players, setPlayers] = useState<string[]>([])
//   const [socket, setSocket] = useState<Socket | null>(null)
  const [currentRoom, setCurrentRoom] = useState<null | string>(null)
//   const [playerTurn, setPlayerTurn] = useState(false)

  return (
    <div>
      {currentRoom && <h1>You Are in Room: {currentRoom}</h1>}
      {/* {playerTurn && <h1>Your Turn</h1>} */}
      {currentRoom && (
        <div>
          <h1>Players in room</h1>
          {players.map((player, i) => {
            return (
              <p key={i}>{player}</p> 
            )
          })}
        </div>
      )}
      <button onClick={() => {
          socket.sendState({ type: 'gameStart', roomName: currentRoom })
        }} > Start </button>
      <input value={userName}
        type='text'
        placeholder={userName + ' (nickName)'}
        onChange={(e) => {
          onUserName(e.target.value)
        }} />
      <CreateRoom onSubmit={(roomName) => {
          socket.sendState({ type: 'createRoom', roomName: roomName })
        }} />
      <h2>Rooms</h2>
      {!currentRoom &&
        rooms.map((room, i) => (
          <p key={i} onClick={() => {
              if (!userName) {
                return
              }
              onRoomEnter(room);
            //   setCurrentRoom(room)
            //   socket.sendState({
            //     type: 'connect',
            //     roomName: rooms,
            //     userName: userName,
            //   })
            socket.sendState({
                type: 'poker',
                roomName: rooms,
                data: {
                    type: 'join',
                    data: {
                        name: userName,
                    }
                },
                userName: userName,
              })
            }} > room {room}</p>
        ))}
      {currentRoom && (
        <>
          <div>
            <button>Button 1</button>
            <button onClick={() => {
                socket.sendState({ type: 'answer', roomName: currentRoom })
              }} > Button 2 </button>
          </div>
          <h2>chat</h2>
          {messages.map((messageData, i) => {
            return (
              <p key={i}> {messageData.author}: {messageData.message} </p>
            )
          })}
        </>
      )}
      <input type='text' value={text} onChange={(e) => {
          setText(e.target.value)
        }} />
      <button onClick={() => {
          socket.sendState({
            type: 'chatMessage',
            data: text,
            room: currentRoom,
            author: userName,
          })
        }}> Send </button>
      </div>
    )    
}