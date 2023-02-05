import React, { useEffect, useRef, useState } from "react";
import TwoCards from '../two-cards/two-cards';
import '../../style.css';
import './player.css';
import { ICard, IPlayer } from "../../interfaces";

type PlayerProps = {
  player: IPlayer;
  place: number;
  isCurrent: boolean;
  isOpened: boolean;
  isWinner: boolean;
}

export default function Player({ player, place, isCurrent, isOpened, isWinner }: PlayerProps) {
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
    <div className={`abs player tp${place} ${isWinner ? 'player--winner' : ''}`}>
      <div className="player__wrapper">
        <div className='player__name'>{name}</div>
        <div className="player__info">

          <div className="player__timer">
            {/* <button style={{ width: 70, height: 20 }} onClick={() => {
           setTimerAnimation(last => !last);
          }}>Start timer</button> */}
            <div ref={timer} className='player__time' style={{ '--progress': progress }}>
              <div className='player__ava'>AA</div>
            </div>
          </div>

          <div className='player__bank'>
            <TwoCards cards={cards} isFold={isFold} isOpened={isOpened}/>
            {isFold ? 'Player is out' : ''}
            <div className="player__chips">{chips}</div>
            <div className="player__bet">{bet > 0 && bet}</div>
          </div>
        </div>
      </div>
    </div>
  )
}