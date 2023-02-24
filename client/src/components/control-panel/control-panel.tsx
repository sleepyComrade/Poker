import React, { useEffect, useState } from "react";
import { IActions, IDataAsk } from "../../interfaces";
import '../../style.css';
import './control-panel.css';

type ControlPanelProps = {
  dataAsk: IDataAsk;
}

export default function ControlPanel({ dataAsk }: ControlPanelProps) {
  const actions = dataAsk?.actions || {};
  const range = dataAsk?.raiseRange || null;
  const minValue = range?.min || 0;
  const maxValue =  range?.max || 0;

  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(minValue);
  }, [dataAsk])

  return (
    <div className="control-panel">
      <div className="buttons-panel">
        {actions.fold &&
          <button className="btn button-player button-player--fold" onClick={() => actions.fold()}>Fold</button>
        }

        {actions.check &&
          <button className="btn button-player button-player--check" onClick={() => actions.check()}>Check</button>
        }

        {actions.bet &&
          <button className="btn button-player button-player--bet" onClick={() => actions.bet(value)}>Bet</button>
        }

        {actions.call &&
          <button className="btn button-player button-player--call" onClick={() => actions.call()}>Call</button>
        }

        {actions.raise &&
          <button className="btn button-player button-player--raise" onClick={() => actions.raise(value)}>Raise to</button>
        }
      </div>

      <div className="range-panel">
        <div className="range-panel__pot-buttons">
          <button className="btn range-panel__button range-panel__button--min">Min</button>
          <button className="btn range-panel__button range-panel__button--half-pot">1/2 Pot</button>
          <button className="btn range-panel__button range-panel__button--pot">Pot</button>
          <button className="btn range-panel__button range-panel__button--max">Max</button>
        </div>

        <div className="range-panel__wrapper">
          <span className="range-panel__range-value">{value}</span>
          <button className="btn range-panel__range-button range-panel__range-button--minus">-</button>

          <div className="range-panel__container">

            <div className="range-panel__slider">
              <div className="range-panel__progress"></div>
            </div>

            <div className="range-panel__range-container">
              <input className="range-panel__input-range" type="range" min={minValue} max={maxValue} value={value} 
              onChange={(e) => {
                setValue(e.target.valueAsNumber);
              }} />
            </div>

          </div>

          <button className="btn range-panel__range-button range-panel__range-button--plus">+</button>
        </div>
      </div>
    </div>
  )
}