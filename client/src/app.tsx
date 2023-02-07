import React, { useEffect, useState } from 'react'
import Socket from './components/socket'
import { Poker } from './game/poker'
import { CreateRoom } from './CreateRoom/CreateRoom'
// import { IRoom } from '../../interfaces/IRoom'
import { IMessage } from './interfaces/IMessage'
import { RoomLogic } from './game/room-logic' 
import Lobby from './lobby/lobby';

const routes = {
  lobby: Lobby,
  poker: Poker,
};

export function App() {
  const [messages, setMessages] = useState<IMessage[]>([])
  const [rooms, setRooms] = useState<string[]>([])
  // const [text, setText] = useState('')
  const [userName, setUserName] = useState(Math.random().toString())
  const [players, setPlayers] = useState<string[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentRoom, setCurrentRoom] = useState<null | string>(null)
  // const [playerTurn, setPlayerTurn] = useState(false)
  const [activePage, setActivePage] = useState<keyof typeof routes>('lobby');
  const [roomLogic, setRoomLogic] = useState<RoomLogic | null>(null);

  useEffect(() => {
    const socket = new Socket();
    socket.onMessage = (message) => {
      console.log('message', message)
      setMessages((last) => [...last, message])
      console.log('messages:', messages)
    }
    socket.onRoomCreate = (rooms) => {
      setRooms(rooms)
      console.log(rooms)
    }
    socket.onTurn = (playerTurn) => {
      // setPlayerTurn(playerTurn)
    }
    socket.onRoomConnectionsUpdate = (connections) => {
      // setPlayers(connections)
    }
    setSocket(socket);
    const room = new RoomLogic();
    room.onMessage = () => {
      
    }
    setRoomLogic(room);
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
    // <div>
    //   {currentRoom && <h1>You Are in Room: {currentRoom}</h1>}
    //   {playerTurn && <h1>Your Turn</h1>}
    //   {currentRoom && (
    //     <div>
    //       <h1>Players in room</h1>
    //       {players.map((player, i) => {
    //         return (
    //           <p key={i}>{player}</p> 
    //         )
    //       })}
    //     </div>
    //   )}
    //   <button
    //     onClick={() => {
    //       socket.sendState({ type: 'gameStart', roomName: currentRoom })
    //     }}
    //   >
    //     Start
    //   </button>
    //   <input
    //     type='text'
    //     placeholder={userName + ' (nickName)'}
    //     onChange={(e) => {
    //       setUserName(e.target.value)
    //     }}
    //   />
    //   <CreateRoom
    //     onSubmit={(roomName) => {
    //       socket.sendState({ type: 'createRoom', roomName: roomName })
    //     }}
    //   />
    //   <h2>Rooms</h2>
    //   {!currentRoom &&
    //     rooms.map((room, i) => (
    //       <p
    //         key={i}
    //         onClick={() => {
    //           if (!userName) {
    //             return
    //           }
    //           setCurrentRoom(room)
    //           socket.sendState({
    //             type: 'connect',
    //             roomName: rooms,
    //             userName: userName,
    //           })
    //         }}
    //       >
    //         room {room}
    //       </p>
    //     ))}
    //   {currentRoom && (
    //     <>
    //       <div>
    //         <button>Button 1</button>
    //         <button
    //           onClick={() => {
    //             socket.sendState({ type: 'answer', roomName: currentRoom })
    //           }}
    //         >
    //           Button 2
    //         </button>
    //       </div>
    //       <h2>chat</h2>
    //       {messages.map((messageData, i) => {
    //         return (
    //           <p key={i}>
    //             {messageData.author}: {messageData.message}
    //           </p>
    //         )
    //       })}
    //     </>
    //   )}
    //   <input
    //     type='text'
    //     value={text}
    //     onChange={(e) => {
    //       setText(e.target.value)
    //     }}
    //   />
    //   <button
    //     onClick={() => {
    //       socket.sendState({
    //         type: 'chatMessage',
    //         data: text,
    //         room: currentRoom,
    //         author: userName,
    //       })
    //     }}
    //   >
    //     Send
    //   </button>
    <>
      {activePage == 'lobby' ?  

        <Lobby socket={socket} rooms={rooms} players={players} messages={messages} userName={userName} 
          onRoomEnter={(room) => {
            setCurrentRoom(room);
            setActivePage('poker');
          }} 
          onUserName={(value) => setUserName(value)}/> : 

        <Poker roomLogic={roomLogic} socket={socket} currentRoom={currentRoom} name={userName} onGameExit={() => setActivePage('lobby')}/> }         
    </>
  )
  {/* <Poker></Poker> */ }
  {/* <Pk /> */ }
  {/* <Garage /> */ }
  {/* <Game /> */ }
  // </div>

}
