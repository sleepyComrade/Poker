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
  socketState: string;
}

function login(props: AuthorizationProps, name: string, password: string) {
  props.socket.sendState({
    type: 'user',
    data: {
      type: 'login',
      data: {
        name: name,
        password: password
      }
    },
  }).then(res => {
    console.log(res);
    switch (res.status) {
      case 'login':{
        const user = {
          id: res.id,
          userName: res.userName,
          chips: res.chips,
          lastBonusTime: res.lastBonusTime + Date.now(),
          avatarUrl: res.avatarUrl
        };
        props.setUser(user);
        localStorage.setItem('b6fe147178bcfc06652a9d3be2c98dd89user', JSON.stringify({name, password}));
        props.setActivePage();
        break;
      }
      case 'Sign up': {
        props.setAuthError('');
        const status = res.status;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            props.setAuthError(status);
          })
        })
        break;
      }
      case 'Wrong password':{
        props.setAuthError('');
        const status = res.status;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            props.setAuthError(status);
          })
        })
        break;
      }
      default:
        break;
    }
  })
}

function signup(props: AuthorizationProps, name: string, password: string) {
  if (name && password) {
    props.socket.sendState({
      type: 'user',
      data: {
        type: 'register',
        data: {
          name: name,
          password: password
        }
      },
    }).then(res => {
      console.log(res);
      switch (res.status) {
        case 'Try to login': {
          props.setAuthError('');
          const status = res.status;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              props.setAuthError(status);
            })
          })
          break;
        }
        case 'registered':
          const newUser = {
            id: res.id,
            userName: res.userName,
            chips: res.chips,
            lastBonusTime: res.lastBonusTime + Date.now(),
            avatarUrl: res.avatarUrl
          };
          localStorage.setItem('b6fe147178bcfc06652a9d3be2c98dd89user', JSON.stringify({name, password}));
          props.setUser(newUser);              
          props.setActivePage();
        break;
        default:
          break;
      }
    })
  } else {
    props.setAuthError('');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        props.setAuthError('Enter name and password');
      })
    })
  }
}

export function Authorization(props: AuthorizationProps) {
  const [authUser, setAuthUser] = useState('');
  const [userPassword, setUserPassword] = useState('');

  useEffect(() => {
    if (props.socket && props.socketState === 'connected') {
      try {
        const userData = JSON.parse(localStorage.getItem('b6fe147178bcfc06652a9d3be2c98dd89user'));
        if (userData) {
          login(props, userData.name, userData.password);
        }
      } catch (error) {
        console.log('Local storage error');
      }
    }
  }, [props.socket, props.socketState]);

  return (
    <div className="auth">
      <div className="auth__wrapper">
        <div className="auth__center-container">

          {props.socketState !== 'connecting' && <form action="" method="get" className="auth__form" onSubmit={(e) => {
            e.preventDefault();            
          }}>
            <div className="auth__login-block">

              <p className="auth__login-wrapper">
                <label htmlFor="login">Name</label>
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

              <button disabled={props.socketState !== 'connected'} className="btn auth__button auth__button--login" onClick={() => {
                login(props, authUser, userPassword);
              }}>Log in</button>
            </div>

            <button disabled={props.socketState !== 'connected'} className="btn auth__button auth__button--register" onClick={() => {
              signup(props, authUser, userPassword);
            }}>Sign Up</button>

           {props.authError && <div className={`auth__error-message show-error-message`}>{props.authError}</div>}

            <button className="btn auth__button auth__button--guest" onClick={() => {
              props.setGuest();
            }}>Log in as a guest</button>

            {props.socketState === 'connecting' && <div style={{ color: 'white'}}>Try connect socket</div>}
            {props.socketState === 'closed' && <div style={{ color: 'white'}}>Socked is unavailable, guest mode only</div>}

          </form>}
        </div>
      </div>
    </div>
  )
}
