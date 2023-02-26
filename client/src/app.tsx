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
  const [socketState, setSocketState] = useState<string>('connecting');
  const [currentRoom, setCurrentRoom] = useState<null | string>(null);
  const [activePage, setActivePage] = useState<keyof typeof routes>('authorization');
  const [roomLogic, setRoomLogic] = useState<RoomLogic | null>(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [player, setPlayer] = useState<Player>(null);
  const [user, setUser] = useState<IUserData>(null);
  // const [isGuest, setIsGuest] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isClientOut, setIsClientOut] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const isGuest = user === null;

  useEffect(() => {
    const socket = new Socket();
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
    socket.onPokerResponse = () => {
      console.log('hello');
      
    }
    socket.onUserUpdate = (userData) => {
      console.log(userData);
      setUser({...userData, lastBonusTime: userData.lastBonusTime + Date.now()});
    }

    const room = new RoomLogic();
    room.onMessage = () => {
      
    }
    socket.onClose = () => {
      setSocket(null);
      setSocketState('closed');
    }
    socket.onConnect = async () => {
      setSocket(socket);
      setSocketState('connected');
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
        <Lobby onUserUpdate={(user: IUserData) => {
          setUser(user);
        }} onLogOut={() => {
          console.log('User', user, isGuest);
          
          if (isGuest === true) {
            setActivePage('authorization');
          } else {
            socket.sendState({
              type: 'logout',
              data: {
                type: 'logout',
                data: {}
              },
            }).then(res => {
              console.log('!!!!sfdgs!!!', res);
              setActivePage('authorization');
              // setIsGuest(true);
              setUser(null);
            })
          }
        }} isGuest={isGuest} user={user} roomLogic={roomLogic} socket={socket} rooms={rooms} players={players} messages={messages} userName={userName} 
          onRoomEnter={(room, playerId, player) => {
            setCurrentRoom(room);
            setActivePage('poker');
            setPlayerIndex(playerId);
            setPlayer(player);
            setIsClientOut(false);
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
          // setIsGuest(true);
          setActivePage('lobby');
        }} socket={socket} socketState={socketState} /> :
        <Poker onPlaceClick={(index: number) => {
          if (currentRoom) {
            const res = socket.sendState({
              type: 'poker',
              roomName: currentRoom,
              data: {
                type: 'takeSit',
                data: {
                  name: user.userName,
                  index
                }
              },
              userName: user.userName,
            })
            res.then(data => {
              if (data.success) {
                setPlayerIndex(index);
                setIsClientOut(false);            
              }
            })
          } else {
            roomLogic.takeSit(player.name, index);
            setPlayerIndex(index);
            setIsClientOut(false);
          }
        }} onStateChange={(bool: boolean)=> {
          setIsClientOut(bool);
        }} isClientOut={isClientOut} player={player} roomLogic={roomLogic} socket={socket} currentRoom={currentRoom} playerIndex={playerIndex} name={userName} onGameExit={() => {
          player.leave().then(() => {
            setActivePage('lobby');
          });
        }}/> }         
    </>
  )
}
