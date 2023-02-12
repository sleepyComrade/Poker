import React, { useEffect, useState } from "react";
import Socket from "../components/socket";

type AuthorizationProps = {
  socket: Socket;
}

export function Authorization(props: AuthorizationProps) {
  const [authUser, setAuthUser] = useState('');
  const [userPassword, setUserPassword] = useState('');

  return (
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
          
        })
      }}>Log in</button>
    </div>
  )
}