import React, { useEffect, useRef, useState } from "react";
import TwoCards from '../two-cards/two-cards';
import '../../style.css';
import './main-player.css';
import img from '../../assets/222.png';

export default function MainPlayer() {
    const [timerAnimation, setTimerAnimation] = useState(false);
    const timer = useRef<HTMLDivElement>();
    const [progress, setProgress] = useState(0);
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
                        if(next > 100) {
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
            if(frame) {
                cancelAnimationFrame(frame);
                frame = null;
            }
        }
    }, [timerAnimation]);



    return (
        <div className="main-player">
            <img className="main-player__chair" src={img} alt="" />
            <div className={`abs player1 tp7`}>
                <button style={{ width: 100, height: 20 }} onClick={() => {
                    setTimerAnimation(last => !last);
                }}>Start timer</button>
                <div ref={timer} className='main-player_time' style={{ '--progress': progress }}>
                    <div className='main-player_ava'>YOU</div>
                </div>
                <div className='main-player_nc_wrapper'>
                    <div className='main-player_name'>Anyj Anykiewicz</div>
                    <div className='main-player_cash'>23 456</div>
                </div>

                <TwoCards />
            </div>
        </div>

    )
}