import React, { useEffect, useRef, useState } from "react";
import TwoCards from '../two-cards/two-cards';
import DealerLabel from '../dealer-label/dealer-label';
import '../../style.css';
import './player.css';
import { ICard, IPlayer } from "../../interfaces";
import { animate } from "../../game/animate";
import { avatarUrl } from '../../const';

type PlayerProps = {
  player: IPlayer;
  place: number;
  isCurrent: boolean;
  isOpened: boolean;
  isWinner: boolean;
  winCards: Array<ICard> | null;
  isDealer: boolean;
}

const isDebug = false;

export default function Player({ player, place, isCurrent, isOpened, isWinner, winCards, isDealer }: PlayerProps) {
  const { name, isFold, chips, cards, bet } = player;
  const [timerAnimation, setTimerAnimation] = useState(false);
  const timer = useRef<HTMLDivElement>();
  const [progress, setProgress] = useState(0);
  const [lastChips, setLastChips] = useState(0);
  const [ava, setAva] = useState<string | null>(null);

  useEffect(() => {
    if (chips == lastChips) {
      return () => { }
    }
    const speed = Math.abs(chips - lastChips);
    let currentChips = lastChips;
    const cancel = animate((delta) => {
      const sign = Math.sign(chips - lastChips);
      currentChips += sign * delta * speed / 500;
      if ((sign * currentChips) < (sign * chips)) {
        setLastChips(Math.floor(currentChips));
      } else {
        setLastChips(chips)
        return false;
      }
      return true;
    })
    return () => {
      setLastChips(chips);
      cancel();
    }
  }, [chips]);

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

  useEffect(() => {
    fetch(`${avatarUrl}${name}`).then(res => {
      if (res.status == 200) {
        return res.blob();
      } else {
        return null;
      }
    }).then(res => {
      if (res) {
        setAva(URL.createObjectURL(res));
      } else {
        setAva(null);
      }
    }).catch(e => {
      setAva(null);
    })
    return () => {
      if (ava) URL.revokeObjectURL(ava);
    }
  }, [name]);

  return (
    <div className={`abs player tp${place} ${isWinner ? 'player--winner' : ''}`}>
      <div className="player__wrapper">
        <div className='player__name'>{isDebug ? name + (place - 1) : name}</div>
        <div className="player__info">

          <div className="player__timer">
            <div ref={timer} className='player__time' style={{ '--progress': progress }}>
              <div className='player__ava'>
                {ava ? <img className='player__ava-img' src={ava} /> : <span>{name.slice(0, 3)}</span>}
              </div>
            </div>
          </div>

          {isDealer && <DealerLabel />}

          <div className='player__bank'>
            <TwoCards cards={cards} isFold={isFold} isOpened={isOpened} winCards={winCards} />
            {isFold ? <p className="player__fold">Fold</p> : ''}
            <div className="player__chips">{lastChips}</div>
            <div className="player__bet">{bet > 0 && bet}</div>
          </div>
        </div>
      </div>
    </div>
  )
}