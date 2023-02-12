import React, { useEffect, useState } from 'react';
import Socket from './components/socket';
import { Poker } from './game/poker';
import { IMessage } from './interfaces/IMessage';
import { RoomLogic } from './game/room-logic' ;
import Lobby from './lobby/lobby';
import { Player } from './game/players';

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
  const [player, setPlayer] = useState<Player>(null);

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
    socket.onConnect = async () => {
      
      console.log("HelloWorld")
      socket.sendState({
        type: "getRooms",
      }).then((res) => {
        console.log("rooms resolve", res.rooms)
        setRooms(res.rooms)
        console.log("!!!!!!!!!ROOMS", rooms)
      })
    }
    setRoomLogic(room);
    return () => socket.destroy();
  }, [])

  useEffect(() => {
    if (!socket) {
      return
    } 

  }, [socket])

  return (
    <>
      {activePage == 'lobby' ?  

        <Lobby roomLogic={roomLogic} socket={socket} rooms={rooms} players={players} messages={messages} userName={userName} 
          onRoomEnter={(room, playerId, player) => {
            setCurrentRoom(room);
            setActivePage('poker');
            setPlayerIndex(playerId);
            setPlayer(player);
          }} 
          onUserName={(value) => setUserName(value)}/> : 

        <Poker player={player} roomLogic={roomLogic} socket={socket} currentRoom={currentRoom} playerIndex={playerIndex} name={userName} onGameExit={() => setActivePage('lobby')}/> }         
    </>
  )
}
