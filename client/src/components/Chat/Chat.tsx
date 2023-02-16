import React, { useState } from "react";
import {IMessage} from "../../../../interfaces/IMessage";
import '../../style.css';
import "./chat.css";

interface IProps {
  messages: IMessage[]
  onMessageCreate: (message: string) => void
}

export function Chat(props: IProps) {
  const [message, setMessage] = useState("")

  return (
    <div className="chat">
      <div className="chat-messages">
        {props.messages.map((message, indx) => {
          return (
            <p key={indx}><span className="chat__author">{message.author}:</span>  <span className="chat__message">{message.message}</span></p> 
          )
        })}
      </div>
      <div>
        <input className="chat__input" onChange={(e) => {
          setMessage(e.target.value)
        }} type="text" value={message}/>
        <button className="btn chat__button chat__button--submit" type="submit" onClick={() => {
          setMessage("")
          props.onMessageCreate(message)
        }}></button>  
      </div>


     
      
    </div>
  )
}
