import React, { useEffect, useState } from "react";
import { IUserData } from "../../../interfaces/IUser";
import Socket from "../components/socket";
import '../style.css';
import './authorization.css';

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
    <div className="auth">
      <div className="auth__wrapper">
        <div className="auth__center-container">

          <form action="" method="get" className="auth__form" onSubmit={(e) => {
            e.preventDefault();            
          }}>
            <div className="auth__login-block">

              <p className="auth__login-wrapper">
                <label htmlFor="login">Login </label>
                <input className="auth__input auth__input--login" onChange={(e) => {
                  setAuthUser(e.target.value);
                }} value={authUser} type="text" id="login" />
              </p>

              <p className="auth__password-wrapper">
                <label htmlFor="password">Password </label>
                <input className="auth__input auth__input--password"
                  value={userPassword} type="password" onChange={(e) => {
                    setUserPassword(e.target.value);
                  }} id="password" />
              </p>

              <button className="btn auth__button auth__button--login" onClick={() => {
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
                      const user = {
                        id: res.id,
                        userName: res.userName,
                        chips: res.chips,
                        lastBonusTime: res.lastBonusTime + Date.now(),
                      };
                      props.setUser(user);
                      // localStorage.setItem('b6fe147178bcfc06652a9d3be2c98dd89user', JSON.stringify(user));
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

            <button className="btn auth__button auth__button--register" onClick={() => {
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
                      lastBonusTime: res.lastBonusTime + Date.now(),
                    };
                    // localStorage.setItem('b6fe147178bcfc06652a9d3be2c98dd89user', JSON.stringify(newUser));
                    props.setUser(newUser);              
                    props.setActivePage();
                  break;
                  default:
                    break;
                }
              })
            }}>Register</button>

           <div className={`auth__error-message ${props.authError ? 'show-error-message' : ''}`}>{props.authError}</div>

            <button className="btn auth__button auth__button--guest" onClick={() => {
              props.setGuest();
            }}>Log in as a guest</button>

          </form>
        </div>
      </div>
    </div>
  )
}