import React, { useEffect, useRef, useState } from "react";
import TwoCards from '../two-cards/two-cards';
import '../../style.css';
import './player.css';
import { ICard, IPlayer } from "../../interfaces";

type PlayerProps = {
  player: IPlayer;
  place: number;
  isCurrent: boolean;
}

export default function Player({ player, place, isCurrent }: PlayerProps) {
  const { name, isFold, chips, cards, bet } = player;
  const [timerAnimation, setTimerAnimation] = useState(false);
  const timer = useRef<HTMLDivElement>();
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // if(isCurrent) {
      setProgress(0);
      setTimerAnimation(isCurrent);
    // } 
  }, [isCurrent])


  useEffect(() => {
    let pr = 0;
    let frame: number = null;
    const render = (lastTime?: number) => {
      frame = requestAnimationFrame((time) => {
        if (lastTime) {
          const delta = time - lastTime;
          // console.log(delta);
          setProgress(last => {
            let next = last + delta / 50;
            if (next > 100) {
              next = 100;
              setTimerAnimation(false);
            }
            return next;
          })
          // let next = pr + delta / 50;
          // if (next > 100) {
          //     next = 100;
          //     setTimerAnimation(false);
          // }
          // pr = next;
          // timer.current.style.setProperty('--progress', pr.toString());
        }

        render(time)
      })
    }
    if (timerAnimation) {
      render();
    }
    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    }
  }, [timerAnimation]);
  // console.log(name, place);
  return (
    <div className={`abs player tp${place}`}>
      <div className="player__timer">
        {/* <button style={{ width: 70, height: 20 }} onClick={() => {
          setTimerAnimation(last => !last);
        }}>Start timer</button> */}
        <div ref={timer} className='player_time' style={{ '--progress': progress }}>
          <div className='player_ava'>AA</div>
        </div>
      </div>

      <div className='player_nc_wrapper'>
        <div className='player_name'>{name}</div>
        <div className='player_cash'>23 456</div>
        {isFold ? <span style={{ color: 'White', fontSize: 26 }}>'Player is out'</span> : ''}
        <div>{chips}</div>
      </div>
      <div>{bet > 0 && bet}</div>
      <TwoCards cards={cards} isFold={isFold} />
    </div>
  )
}