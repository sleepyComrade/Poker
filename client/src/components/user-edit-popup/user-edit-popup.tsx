import React, { useEffect, useRef, useState } from "react";

type UserEditPopupProps = {
  onClose: () => void;
}

export default function UserEditPopup({onClose}: UserEditPopupProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if(image) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const aspect = image.naturalWidth / image.naturalHeight;
      const minSize = Math.min(image.naturalWidth, image.naturalHeight);
      const offsetX = aspect < 1 ? 0 : (image.naturalWidth - minSize) / 2;
      const offsetY = aspect > 1 ? 0 : (image.naturalHeight - minSize) / 2;
      ctx?.drawImage(image, offsetX, offsetY, minSize, minSize, 0, 0, canvas.width, canvas.height);
    }   
  }, [image]);

  return (
    <div>
      <canvas ref={canvasRef} width={256} height={256}></canvas>
      <input type="file" onChange={(e) => {
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
      <button onClick={() => onClose() }>Ok</button>
    </div>
  )
}