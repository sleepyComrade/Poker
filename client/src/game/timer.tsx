import React, { useEffect, useMemo, useState } from "react";

export function Timer({ initialTime, onClick }: { initialTime: number, onClick: () => void }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let lastTime = Date.now();
    let _time = initialTime - Date.now();
    setTime(_time);
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      if (_time - delta <= 0) {
        clearInterval(interval);
        setTime(0);
      } else {
        _time -= delta;
        setTime(_time);
      }
    }, 100)
    return () => clearInterval(interval);
  }, [initialTime])

  
  const t = new Date(time);

  return (
    <div style={{color: 'white'}}>
      <div>6000</div>
      <button onClick={() => {
        onClick();
      }}>{time <= 0 ? 'Get Bonus' : `${t.getMinutes()}:${t.getSeconds() < 10 ? '0' + t.getSeconds() : t.getSeconds()}`}</button>
    </div>
  )
}