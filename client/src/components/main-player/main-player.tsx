import React, { useEffect, useRef, useState } from "react";
import TwoCards from '../two-cards/two-cards';
import '../../style.css';
import './main-player.css';
import img from '../../assets/222.png';
import { IPlayer } from "../../interfaces";

type PlayerProps = {
  player: IPlayer;
  isCurrent: boolean;
}

export default function MainPlayer({ player, isCurrent }: PlayerProps) {
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
          console.log(delta);
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

  return (
    <div className="main-player">
      <img className="main-player__chair" src={img} alt="" />
      <div className={`abs player1 tp9`}>
        <div className="player__timer">
          {/* <button style={{ width: 100, height: 20 }} onClick={() => {
            setTimerAnimation(last => !last);
          }}>Start timer</button> */}
          <div ref={timer} className='main-player_time' style={{ '--progress': progress }}>
            <div className='main-player_ava'>YOU</div>
          </div>
        </div>

        <div className='main-player_nc_wrapper'>
          <div className='main-player_name'>{name}</div>
          <div className='main-player_cash'>23 456</div>
          {isFold ? 'Player is out' : ''}
          <div>{chips}</div>
        </div>
        <div>{bet > 0 && bet}</div>
        <TwoCards cards={cards} isFold={isFold} />
      </div>
    </div>
  )
}