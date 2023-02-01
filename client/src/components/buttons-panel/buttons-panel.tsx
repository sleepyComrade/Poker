import React, { useEffect, useState } from "react";
import '../../style.css';
import './buttons-panel.css';

export default function ButtonsPanel() {
    return (
        <div className="buttons-panel">
            <div className="buttons-panel__wrapper">
                <button className="btn button-player button-player--fold" onClick={() => console.log('fold')}>Fold</button>
                <button className="btn button-player button-player--call" onClick={() => console.log('call')}>Call</button>
                <button className="btn button-player button-player--raise" onClick={() => console.log('raise')}>Raise to</button>
            </div>
        </div>
    )
}