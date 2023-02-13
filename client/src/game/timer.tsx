import React, { useEffect, useState } from "react";

export function Timer({ initialTime, onClick }: { initialTime: number, onClick: () => void }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    setTime(initialTime);
  }, [initialTime])

  useEffect(() => {
    let lastTime = Date.now();
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      setTime(last => last - delta);
    }, 100)
    return () => clearInterval(interval);
  }, [])

  const t = new Date(time);

  return (
    <div>
      <div style={{color: 'white'}}>6000</div>
      <button disabled={time > 0} onClick={() => {
        onClick();
      }}>{time < 0 ? 'Get Bonus' : `${t.getMinutes()}:${t.getSeconds()}`}</button>
    </div>
  )
}