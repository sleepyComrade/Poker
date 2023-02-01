import React, { useEffect, useState } from "react";
import TwoCards from '../two-cards/two-cards';
import '../../style.css';
import './main-player.css';
import img from '../../assets/222.png';

export default function MainPlayer() {
    return (
        <div className="main-player">
            <img className="main-player__chair" src={img} alt="" />
            <div className={`abs player tp7`}>
                <div className='main-player_time'>
                    <div className='main-player_ava'>AA</div>
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