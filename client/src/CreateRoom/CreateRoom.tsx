import React, { useState } from 'react';
import '../style.css';
import './create-room.css';

interface IProps {
  onSubmit: (roomName: string) => void
}

export const CreateRoom = (props: IProps) => {
  const [roomName, setRoomName] = useState('')

  return (
    <div className='create-room__wrapper'>
      <input className='create-room__input-name'
        type='text'
        placeholder='Room Name'
        onChange={(e) => {
          setRoomName(e.target.value)
        }}
      />
      <button className='btn create-room__button-create'
        onClick={() => {
          if (roomName.length > 0) {
            props.onSubmit(roomName)
          }
        }}
      >
        Create
      </button>
    </div>
  )
}
