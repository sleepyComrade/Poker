import React, { useEffect, useState } from "react";
import { CreateRoom } from './../CreateRoom/CreateRoom';
import Socket from './../components/socket';
import { RoomLogic } from "../game/room-logic";
import { Player } from '../game/players';
import { PlayerClient } from "../game/player-client";
import { IUserData } from "../../../interfaces/IUser";
import { Timer } from '../components/timer/timer';
import UserEditPopup from '../components/user-edit-popup/user-edit-popup';
import '../style.css';
import './lobby.css';
import { avatarUrl } from '../const';
import DevelopBlock from '../components/develop-block/develop-block';
import { IMessage } from "../../../interfaces/IMessage";

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

export default function Lobby({ socket, rooms, players, messages, userName, onUserName, onRoomEnter, roomLogic, user, isGuest, onLogOut }: LobbyProps) {
  const [currentRoom, setCurrentRoom] = useState<null | string>(null);
  const [hasEnoughChips, setHasEnoughChips] = useState(true);
  const [userEditMode, setUserEditMode] = useState(false);
  const [ava, setAva] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${avatarUrl}${user?.userName}`).then(res => {
      if(res.status == 200) {
        return res.blob();
      } else {
        return null;
      }
    }).then(res => {
      if(res) {
        setAva(URL.createObjectURL(res));
      } else {
        setAva(null);
      }
    }).catch(e => {
      setAva(null);
    })
    return () => {
      if(ava) URL.revokeObjectURL(ava);
    }
  }, [user?.userName, user?.avatarUrl]);


  const enterRoom = (room: string) => {
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
      if (user.chips >= 5000) {
        const player = new PlayerClient(user.userName, socket, room, data.playerUID);
        console.log("RES", data)
        onRoomEnter(room, data.playerIndex, player);
      } else {
        setHasEnoughChips(false);
        setTimeout(() => {
          setHasEnoughChips(true);
        }, 3000);
      }
    })
  }

  const getBonus = () => {
    console.log("userID!!!!!!!!!", user.id)
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
        // onUserUpdate({...user, chips: res.chips, lastBonusTime: res.lastBonusTime + Date.now()});
      } else if (res.status === 'error') {
        console.log('Cheating won\'t pass');
      }
    });
  }

  const changeAvatar = (str: string) => {
    setUserEditMode(false)
    if (!str) {
      console.log('image is not selected')
      return
    }
    socket.sendState({
      type: "userAvatar",
      data: {
        img: str.slice(str.indexOf(",") + 1)
      }
    })
  }

  return (
    <div className="lobby">
      <div className="lobby__buttons-wrapper">
        <button className="btn lobby__button lobby__button--log-out" onClick={() => {
          localStorage.removeItem('b6fe147178bcfc06652a9d3be2c98dd89user');
          onLogOut();
        }}>Log Out</button>
      </div>
      {userEditMode && <UserEditPopup onClose={changeAvatar} />}

      {!isGuest &&
        <div className="lobby__user-info user-info">
          <div className="user-info__wrapper">            
            <div className="user-info__picture" onClick={() => {
              setUserEditMode(true)
            }}>
              {ava && <img className="user-info__img" src={`${ava}`} width="100" height="100" alt="avatar" />}
            </div>
            <div className="user-info__info-block">
              <div className="user-info__username">Hello, <span>{user.userName}</span></div>
              <div className="user-info__chips">You have <span>{user.chips}</span> chips</div>
            </div>
          </div>

          <div className="user-info__timer">
            <Timer onClick={getBonus} initialTime={user.lastBonusTime} />
          </div>

          {!hasEnoughChips && <div className="user-info__message">You don't have enough chips to play. Wait for bonus</div>}
        </div>
      }

      <div className="lobby__wrapper">
        <div className="lobby__center-container">
          <button className="btn lobby__button lobby__button--local" onClick={() => {
            const player = new Player('Guest');
            player.chips = 10000;
            const joinResult = roomLogic.join(player);
            onRoomEnter('', joinResult, player);
          }}>Local</button>


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
              <fieldset className="lobby__select-rooms">
                <legend className="lobby__rooms-title lobby__rooms-title--rooms">Rooms</legend>
                <div className="lobby__rooms-list">
                  {!currentRoom &&
                    rooms.map((room, i) => (
                      <p className="lobby__rooms-item" key={i} onClick={() => enterRoom(room)} > <span>{i + 1}.</span> {room}</p>
                    ))}
                </div>
              </fieldset>
            </div>            
          </div>}
        </div>      
      </div>

      <DevelopBlock />
    </div>
  )
}
