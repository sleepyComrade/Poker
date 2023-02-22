import React, { useEffect, useRef, useState } from "react";
import '../../style.css';
import './user-edit-popup.css';
import Socket from "../socket" 

type UserEditPopupProps = {
  onClose: (q: string) => void;
  socket: Socket,
}



export default function UserEditPopup({onClose, socket}: UserEditPopupProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [closePopup, setClosePopup] = useState(false);
  const [q, setQ] = useState<string | null>()
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (image) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const aspect = image.naturalWidth / image.naturalHeight;
      const minSize = Math.min(image.naturalWidth, image.naturalHeight);
      const offsetX = aspect < 1 ? 0 : (image.naturalWidth - minSize) / 2;
      const offsetY = aspect > 1 ? 0 : (image.naturalHeight - minSize) / 2;
      ctx?.drawImage(image, offsetX, offsetY, minSize, minSize, 0, 0, canvas.width, canvas.height);

      setQ(canvas.toDataURL("image/png"))
    }
  }, [image]);

  return (
    <div className={`user-edit-popup ${closePopup ? 'user-edit-popup-close' : ''}`} onAnimationEnd={() => {
      closePopup && onClose() 
     } }> 
      <div className="user-edit-popup__wrapper">
        <canvas className="user-edit-popup__canvas" ref={canvasRef} width={256} height={256}></canvas>

        <div className="user-edit-popup__input-wrapper">
          <label htmlFor="input__file" className="user-edit-popup__label">Choose file</label>
          <input type="file" id="input__file" name="file" className="user-edit-popup__input-avatar" onChange={(e) => {
            const file = e?.target?.files?.[0] || null; 
            if(file) {
              const reader = new FileReader();
              reader.onload = () => {
                const img = new Image();
                if(typeof reader.result == 'string') {
                  img.src = reader.result;
                  setImage(img);
                } else {
                  console.log('file not readed');
                }
               
              }
              reader.readAsDataURL(file);
            }
          }} />
        </div>

        <div className="user-edit-popup__buttons-wrapper">
          <button className="btn user-edit-popup__button user-edit-popup__button--ok" onClick={() => {
            setClosePopup(true);               
          }}>Ok</button>

          <button className="btn user-edit-popup__button user-edit-popup__button--cancel" onClick={() => {                 
            setClosePopup(true);
          }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
