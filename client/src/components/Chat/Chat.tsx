import React, { useState } from "react"
import {IMessage} from "../../../../interfaces/IMessage"
import "./Chat.css"

interface IProps {
  messages: IMessage[]
  onMessageCreate: (message: string) => void
}

export function Chat(props: IProps) {
  const [message, setMessage] = useState("")

  return (
    <div>
      <div>
        <input onChange={(e) => {
          setMessage(e.target.value)
        }} type="text" value={message}/>
        <button type="submit" onClick={() => {
          setMessage("")
          props.onMessageCreate(message)
        }}>send</button>  
      </div>
      <div className={"chatMessages"}>
        {props.messages.map((message, indx) => {
          return (
            <span key={indx}>{message.author}: {message.message}</span> 
          )
        })}
      </div>
    </div>
  )
}
