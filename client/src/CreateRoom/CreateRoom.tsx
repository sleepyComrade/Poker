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
      <label className="create-room__label create-room__label--room-name" htmlFor="rom-name">Create room: </label>
      <div className="create-room__inner-wrapper">
        <input className='create-room__input create-room__input--name' type='text' id='room-name'
          placeholder='Room Name'
          onChange={(e) => {
            setRoomName(e.target.value)
          }}
        />
        <button className='btn create-room__button create-room__button--create'
          onClick={() => {
            if (roomName.length > 0) {
              props.onSubmit(roomName)
            }
          }}
        >
          Create
        </button>

      </div>

    </div>
  )
}
