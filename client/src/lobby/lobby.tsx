import React, { useEffect, useState } from "react";
import { CreateRoom } from './../CreateRoom/CreateRoom';
import Socket from './../components/socket';
import { IMessage } from '../interfaces/IMessage';
import '../style.css';
import './lobby.css';
import { RoomLogic } from "../game/room-logic";
import {Player} from '../game/players';
import { PlayerClient } from "../game/player-client";
import { IUserData } from "../../../interfaces/IUser";
import { Timer } from '../game/timer';

type LobbyProps = {
  socket: Socket;
  rooms: Array<string>;
  players: Array<string>;
  messages: Array<IMessage>;
  userName: string;
  onUserName: (a: string) => void;
  onRoomEnter: (room: string, playerIndex: number, player: Player) => void;
  roomLogic: RoomLogic;
  user: IUserData;
  isGuest: boolean;
  onLogOut: () => void;
  onUserUpdate: (user: IUserData) => void;
}

export default function Lobby({ socket, rooms, players, messages, userName, onUserName, onRoomEnter, roomLogic, user, isGuest, onLogOut, onUserUpdate }: LobbyProps) {
  const [text, setText] = useState('');
  const [currentRoom, setCurrentRoom] = useState<null | string>(null);
  // const [isBonusAvailable, setIsBonusAvailable] = useState(false);
  // const bonusTime = 2;
  // const [seconds, setSeconds] = useState((bonusTime * 60000) - Math.floor(Math.abs((user.lastBonusTime - Date.now()) % 60000) / 1000));
  // const [minutes, setMinutes] = useState(Math.floor(Math.abs(user.lastBonusTime - Date.now()) / 60000));
  
  // const [minutes, setMinutes] = useState(bonusTime - Math.floor((Date.now() - user.lastBonusTime) / 60000));
  // const [seconds, setSeconds] = useState(Math.floor(((Date.now() - user.lastBonusTime) / 1000) % 60));

  // console.log(user);

  // const setTimer = () => {
  //   console.log('??????????????', '!!!!!!!!!');

  //   if (Math.abs(user.lastBonusTime - Date.now()) >= bonusTime * 60000) {
  //     setMinutes(0);
  //     setSeconds(0);
  //     setIsBonusAvailable(true);
  //     console.log('??????????????', user.lastBonusTime);
  //     console.log(Math.abs(user.lastBonusTime - Date.now()));
  //   } else {
  //     console.log('!!!!!!!!!!', user.lastBonusTime, Math.floor(Math.abs(user.lastBonusTime - Date.now()) / 60000), Math.floor(Math.abs(user.lastBonusTime - Date.now()) / 1000));
  //     console.log(Math.abs(user.lastBonusTime - Date.now()));
      
  //     setMinutes(Math.floor(Math.abs(user.lastBonusTime - Date.now()) / 60000));
  //     setSeconds(Math.floor(Math.abs((user.lastBonusTime - Date.now()) % 60000) / 1000));
  //   }
  // }

  // useEffect(() => {
  //   setTimer();
  // }, [])

  // useEffect(() => {
  //   let interval: NodeJS.Timer = null;
  //   if (minutes === 0 && seconds === 0) {
  //     clearInterval(interval);
  //     setIsBonusAvailable(true);
  //   } else if (seconds > 0) {
  //     interval = setInterval(() => {
  //       setSeconds(seconds - 1);
  //     }, 1000);
  //   } else if (seconds === 0 && minutes > 0) {
  //     setMinutes(minutes - 1);
  //     setSeconds(59);
  //   }
  //   return () => clearInterval(interval);
  // }, [minutes, seconds]);

  return (
    <div className="lobby">
      {!isGuest && <div>
        <div className="lobby__user-picture"></div>
        <div style={{color: 'white'}}>{user.userName}</div>
        <div style={{color: 'white'}}>{user.chips}</div>
      </div>}
      {!isGuest && <div>
        <div style={{color: 'white'}}>
          <Timer onClick={() => {
            socket.sendState({
              type: 'bonus',
              data: {
                type: 'bonus',
                data: {
                  id: user.id
                }
              },
            }).then(res => {
              if (res.status === 'updated') {
                onUserUpdate({...user, chips: res.chips, lastBonusTime: res.lastBonusTime});
                // localStorage.setItem('b6fe147178bcfc06652a9d3be2c98dd89user', JSON.stringify(user));
              } else if (res.status === 'error') {
                console.log('Cheating won\'t pass');
              }
            });
          }} initialTime={user.lastBonusTime} />
        </div>
      </div>}
      <div className="lobby__wrapper">
        <div className="lobby__center-container">
          <button className="btn lobby__button lobby__button--local" onClick={() => {
            const player = new Player(userName);
            const joinResult = roomLogic.join(player);
            onRoomEnter('', joinResult, player);
          }}>Local</button>

          <button onClick={() => {
            localStorage.removeItem('b6fe147178bcfc06652a9d3be2c98dd89user');
            onLogOut();
          }}>Log Out</button>

          {!isGuest && <div className="lobby__nav">

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
                        const player = new PlayerClient(userName, socket, room);
                        console.log("RES",data)
                        onRoomEnter(room, data.playerIndex, player);
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
          </div>}
        </div>
      </div>
    </div>
  )
}
