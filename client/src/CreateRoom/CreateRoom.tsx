import React, { useState } from 'react'

interface IProps {
  onSubmit: (roomName: string) => void
}

export const CreateRoom = (props: IProps) => {
  const [roomName, setRoomName] = useState('')

  return (
    <div>
      <input
        type='text'
        placeholder='Room Name'
        onChange={(e) => {
          setRoomName(e.target.value)
        }}
      />
      <button
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
