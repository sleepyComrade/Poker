import React, { useEffect, useState } from 'react';
import Socket from './components/socket';
import { Poker } from './game/poker';
import { IMessage } from './interfaces/IMessage';
import { RoomLogic } from './game/room-logic' ;
import Lobby from './lobby/lobby';

const routes = {
  lobby: Lobby,
  poker: Poker,
};

export function App() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [userName, setUserName] = useState(Math.random().toString());
  const [players, setPlayers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentRoom, setCurrentRoom] = useState<null | string>(null);
  const [activePage, setActivePage] = useState<keyof typeof routes>('lobby');
  const [roomLogic, setRoomLogic] = useState<RoomLogic | null>(null);
  const [playerIndex, setPlayerIndex] = useState(0);

  useEffect(() => {
    const socket = new Socket();
    socket.onMessage = (message) => {
      setMessages((last) => [...last, message]);
    }
    socket.onRoomCreate = (rooms) => {
      setRooms(rooms);
      console.log(rooms);
    }
    socket.onTurn = (playerTurn) => {

    }
    socket.onRoomConnectionsUpdate = (connections) => {
      
    }
    socket.onRoomJoin = (data) => {
      if (!data.succes) {
        return;
      }
      console.log("join success");
    }
    setSocket(socket);
    socket.onPokerResponse = () => {
      console.log('hello');
      
    }
    const room = new RoomLogic();
    room.onMessage = () => {
      
    }
    setRoomLogic(room);
    return () => socket.destroy();
  }, [])

  useEffect(() => {
    console.log('try fetch');
    fetch('http://localhost:4002/rooms')
      .then((res) => res.json())
      .then((data) => {
        console.log('!!!!!!!!', data);
        setRooms(data);
      })
  }, [])

  return (
    <>
      {activePage == 'lobby' ?  

        <Lobby socket={socket} rooms={rooms} players={players} messages={messages} userName={userName} 
          onRoomEnter={(room, playerId) => {
            setCurrentRoom(room);
            setActivePage('poker');
            setPlayerIndex(playerId)
          }} 
          onUserName={(value) => setUserName(value)}/> : 

        <Poker roomLogic={roomLogic} socket={socket} currentRoom={currentRoom} playerIndex={playerIndex} name={userName} onGameExit={() => setActivePage('lobby')}/> }         
    </>
  )
}
