import React, { useEffect, useRef, useState } from "react";
import TwoCardsMainPlayer from '../two-cards--main-player/two-cards--main-player';
import DealerLabel from "../dealer-label/dealer-label";
import '../../style.css';
import './main-player.css';
import img from '../../assets/222.png';
import { ICard, IPlayer } from "../../interfaces";

type PlayerProps = {
  player: IPlayer;
  isCurrent: boolean;
  isWinner: boolean;
  winCards: Array<ICard> | null;
  isDealer: boolean;
  place: number;
}

export default function MainPlayer({ player, isCurrent, isWinner, winCards, isDealer, place }: PlayerProps) {
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

  return (
    <div className="main-player">
      <img className="main-player__chair" src={img} alt="" />

      <div className={`abs player1 tp${place} ${isWinner ? 'player--winner' : ''}`}>
        <div className="main-player__wrapper">
          <div className='main-player__name'>{name}</div>
          <div className="main-player__info">
            <div className="main-player__timer">
              {/* <button style={{ width: 100, height: 20 }} onClick={() => {
            setTimerAnimation(last => !last);
          }}>Start timer</button> */}
              <div ref={timer} className='main-player__time' style={{ '--progress': progress }}>
                <div className='main-player__ava'>YOU</div>
              </div>
            </div>

            {isDealer &&  <DealerLabel />}

            <div className='main-player__bank'>
              <TwoCardsMainPlayer cards={cards} isFold={isFold} winCards={winCards} />
              {isFold ? <p className="main-player__fold">Fold</p> : ''}
              <div className="main-player__chips">{chips}</div>
              <div className="main-player__bet">{bet > 0 && bet}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}