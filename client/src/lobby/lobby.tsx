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
  onRoomEnter: (room: string, playerIndex: number) => void;
}

export default function Lobby({ socket, rooms, players, messages, userName, onUserName, onRoomEnter }: LobbyProps) {
  //   const [messages, setMessages] = useState<IMessage[]>([])
  //   const [rooms, setRooms] = useState<string[]>([])
  const [text, setText] = useState('')
  //   const [userName, setUserName] = useState(Math.random().toString())
  //   const [players, setPlayers] = useState<string[]>([])
  //   const [socket, setSocket] = useState<Socket | null>(null)
  const [currentRoom, setCurrentRoom] = useState<null | string>(null)
  //   const [playerTurn, setPlayerTurn] = useState(false)

  return (
    <div className="lobby">
      <div className="lobby__wrapper">
        <div className="lobby__center-container">
          <button className="btn lobby__button lobby__button--local" onClick={() => onRoomEnter('')}>Local</button>

          <div className="lobby__nav">

            <div className="lobby__start-game">
              <label className="lobby__label lobby__label--user-name" htmlFor="user-name">Enter your name: </label>
              <div className="lobby__start-game-wrapper">
                <input className="lobby__input lobby__input--user-name" value={userName} id="user-name" type='text'
                  placeholder={userName + ' (nickName)'}
                  onChange={(e) => {
                    onUserName(e.target.value)
                  }} />
                <button className="btn lobby__button lobby__button--start" onClick={() => {
                  socket.sendState({ type: 'gameStart', roomName: currentRoom })
                }} > Start </button>
              </div>
            </div>

            <div className="lobby__rooms">
              {currentRoom && <h2 className="lobby__title">You Are in Room: {currentRoom}</h2>}
              {/* {playerTurn && <h1>Your Turn</h1>} */}
              {currentRoom && (
                <div className="lobby__players">
                  <h2 className="lobby__title">Players in room</h2>
                  {players.map((player, i) => {
                    return (
                      <p key={i}>{player}</p>
                    )
                  })}
                </div>
              )}

              <CreateRoom onSubmit={(roomName) => {
                socket.sendState({ type: 'createRoom', roomName: roomName })
              }} />
              <h2 className="lobby__rooms-title">Rooms</h2>
              <div className="lobby__rooms-list">
                {!currentRoom &&
                  rooms.map((room, i) => (
                    <p className="lobby__rooms-item" key={i} onClick={() => {
                      const res = socket.sendState({
                        type: 'poker',
                        roomName: room,
                        data: {
                            type: 'join',
                            data: {
                                name: userName,
                            }
                        },
                        userName: userName,
                      })
        
                      res.then(data => {
                        console.log("Wewewewewe", res)
                        onRoomEnter(room, data.playerIndex)
                        console.log("Resoponse; reqID", data.requestId)
                      })
                    }} > room {room}</p>
                  ))}
              </div>
            </div>

            <div className="lobby__chat">
              {currentRoom && (
                <>
                  <div>
                    <button className="btn lobby__button">Button 1</button>
                    <button className="btn lobby__button" onClick={() => {
                      socket.sendState({ type: 'answer', roomName: currentRoom })
                    }} > Button 2 </button>
                  </div>
                  <h2 className="lobby__title">chat</h2>
                  <div className="lobbi__chat-list">
                  {messages.map((messageData, i) => {
                    return (
                      <p className="lobbi__chat-item" key={i}> {messageData.author}: {messageData.message} </p>
                    )
                  })}
                  </div>                 
                </>
              )}
              <input className="lobby__input lobby__input--chat-message" type='text' value={text}
                onChange={(e) => {
                  setText(e.target.value)
                }} />
              <button className="btn lobby__button lobby__button--chat-send" onClick={() => {
                socket.sendState({
                  type: 'chatMessage',
                  data: text,
                  room: currentRoom,
                  author: userName,
                })
              }}> Send </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
