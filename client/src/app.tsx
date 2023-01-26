import React, { useEffect, useState } from 'react';
import Socket from './components/socket';
import { Poker } from "./game/poker";

export function App() {
  const [messages, setMessages] = useState(['start']);
  const [text, setText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const socket = new Socket();
    socket.onMessage = (message) => {
      console.log(message);
      setMessages(last => [...last, message]);
    };
    setSocket(socket);
    return () => socket.destroy();
  }, [])
  
  return (
    <div>
      <h1>Hello World</h1>
      { messages.map((mes: string) => <p>{mes}</p>) }
      <input
        type="text"
        value={text}
        onChange={(e) => {
        setText(e.target.value);
      }}
      />
      <button type="button" onClick={() => {
        socket.sendState(text);
      }}>Send</button>
      <Poker></Poker>
    </div>
  );
}
