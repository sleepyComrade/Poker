import React, { useEffect, useState } from 'react';
import Socket from './components/socket';
import { Poker } from './game/poker';
import { IMessage } from './interfaces/IMessage';
import { RoomLogic } from './game/room-logic' ;
import Lobby from './lobby/lobby';
import { Player } from './game/players';
import { IUserData } from '../../interfaces/IUser';
import { Authorization } from './authorization/authorization';

const routes = {
  lobby: Lobby,
  poker: Poker,
  authorization: Authorization,
};

export function App() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [userName, setUserName] = useState(Math.random().toString());
  const [players, setPlayers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentRoom, setCurrentRoom] = useState<null | string>(null);
  const [activePage, setActivePage] = useState<keyof typeof routes>('authorization');
  const [roomLogic, setRoomLogic] = useState<RoomLogic | null>(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [player, setPlayer] = useState<Player>(null);
  const [user, setUser] = useState<IUserData>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('b6fe147178bcfc06652a9d3be2c98dd89user') !== null) {
      const data = JSON.parse(localStorage.getItem('b6fe147178bcfc06652a9d3be2c98dd89user'));
      setUser(data);
      setActivePage('lobby');
    } else {
      console.log('No data found in local storage');
    }

    const socket = new Socket();
    // socket.onMessage = (message) => {
    //   setMessages((last) => [...last, message]);
    // }
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

  return (
    <>
      {activePage === 'lobby' ?  
        <Lobby onLogOut={() => {
          setActivePage('authorization');
        }} isGuest={isGuest} user={user} roomLogic={roomLogic} socket={socket} rooms={rooms} players={players} messages={messages} userName={userName} 
          onRoomEnter={(room, playerId, player) => {
            setCurrentRoom(room);
            setActivePage('poker');
            setPlayerIndex(playerId);
            setPlayer(player);
          }} 
          onUserName={(value) => setUserName(value)}/> : 
        activePage === 'authorization' ? 
        <Authorization setActivePage={() => {
          setActivePage('lobby');
        }} authError={authError} setAuthError={(error: string) => {
          setAuthError(error);
        }} setUser={(data: IUserData) => {
          setUser(data);
        }} setGuest={() => {
          setIsGuest(true);
          setActivePage('lobby');
        }} socket={socket} /> :
        <Poker player={player} roomLogic={roomLogic} socket={socket} currentRoom={currentRoom} playerIndex={playerIndex} name={userName} onGameExit={() => setActivePage('lobby')}/> }         
    </>
  )
}
