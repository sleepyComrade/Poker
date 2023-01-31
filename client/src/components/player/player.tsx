import React, { useEffect, useState } from "react";
import TwoCards from '../two-cards/two-cards';
import '../../style.css';
import './player.css';

export default function Player({ place }: { place: number }) {
    return (
        <div className={`abs player tp${place}`}>
            <div className='player_time'>
                <div className='player_ava'>AA</div>
            </div>
            <div className='player_nc_wrapper'>
                <div className='player_name'>Anyj Anykiewicz</div>
                <div className='player_cash'>23 456</div>
            </div>
            <TwoCards />
        </div>
    )
}