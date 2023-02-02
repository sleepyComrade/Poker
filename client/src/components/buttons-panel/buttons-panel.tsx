import React, { useEffect, useState } from "react";
import { IActions } from "../../interfaces";
import '../../style.css';
import './buttons-panel.css';

type ButtonsPanelProps = {
    actions: IActions;
}

export default function ButtonsPanel({ actions }: ButtonsPanelProps) {
    return (
        <div className="buttons-panel">
            <div className="buttons-panel__wrapper">
                {actions.fold &&
                    <button className="btn button-player button-player--fold" onClick={() => actions.fold()}>Fold</button>
                }

                {actions.check && 
                    <button className="btn button-player button-player--check" onClick={() => actions.check()}>Check</button>
                }

                {actions.bet &&
                    <button className="btn button-player button-player--bet" onClick={() => actions.bet()}>Bet</button>
                }

                {actions.call && 
                     <button className="btn button-player button-player--call" onClick={() => actions.call()}>Call</button>
                }

                {actions.raise && 
                    <button className="btn button-player button-player--raise" onClick={() => actions.raise()}>Raise to</button>
                }                
            </div>
        </div>
    )
}