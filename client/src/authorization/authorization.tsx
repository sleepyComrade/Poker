import React, { useEffect, useState } from "react";
import { IUserData } from "../../../interfaces/IUser";
import Socket from "../components/socket";

type AuthorizationProps = {
  socket: Socket;
  setGuest: () => void;
  setUser: (data: IUserData) => void;
  setAuthError: (error: string) => void;
  authError: string;
  setActivePage: () => void;
}

export function Authorization(props: AuthorizationProps) {
  const [authUser, setAuthUser] = useState('');
  const [userPassword, setUserPassword] = useState('');

  return (
    <div>
      <div>
        <input onChange={(e) => {
          setAuthUser(e.target.value);
        }} value={authUser} type="text" />
        <input value={userPassword} type="password" onChange={(e) => {
          setUserPassword(e.target.value);
        }}/>
        <button onClick={() => {
          props.socket.sendState({
            type: 'user',
            data: {
              type: 'login',
              data: {
                name: authUser,
                password: userPassword
              }
            },
          }).then(res => {
            console.log(res);
            switch (res.status) {
              case 'login':
                props.setUser({
                  id: res.id,
                  userName: res.userName,
                  chips: res.chips,
                  lastBonusTime: res.lastBonusTime,
                });
                props.setActivePage();
                break;
              case 'Try to register':
                props.setAuthError(res.status);
              break;
              case 'Wrong password':
                props.setAuthError(res.status);
                break;
              default:
                break;
            }
          })
        }}>Log in</button>
      </div>
      <button onClick={() => {
         props.socket.sendState({
          type: 'user',
          data: {
            type: 'register',
            data: {
              name: authUser,
              password: userPassword
            }
          },
        }).then(res => {
          console.log(res);
          switch (res.status) {
            case 'Try to login':
              props.setAuthError(res.status);
              break;
            case 'registered':
              const newUser = {
                id: res.id,
                userName: res.userName,
                chips: res.chips,
                lastBonusTime: res.lastBonusTime,
              };
              localStorage.setItem('b6fe147178bcfc06652a9d3be2c98dd89user', JSON.stringify(newUser));
              props.setUser(newUser);              
              props.setActivePage();
            break;
            default:
              break;
          }
        })
      }}>Register</button>
      <div>{props.authError}</div>
      <button onClick={() => {
        props.setGuest();
      }}>Log in as a guest</button>
    </div>
  )
}