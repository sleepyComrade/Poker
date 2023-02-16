import React, { useEffect, useMemo, useState } from "react";
import '../../style.css';
import './timer.css';

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
    <div className="timer">
      <div className="timer__bonus-amount">Bonus amount: <span>6000</span></div>
      <button className="btn timer__button" onClick={() => {
        onClick();
      }}>{time <= 0 ? 'Get Bonus' : `${t.getMinutes()}:${t.getSeconds() < 10 ? '0' + t.getSeconds() : t.getSeconds()}`}</button>
    </div>
  )
}