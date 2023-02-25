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
  const blind = dataAsk?.blind;
  const pot = dataAsk?.pot;
  const isPot = pot > 0;
  let halfPot = (pot / 2) - (pot % 50);
  halfPot = halfPot < blind ? blind : halfPot;
  const halfPotSum = isPot ? halfPot : 2 * blind;
  const potSum = isPot ? pot : 4 * blind;

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

      {(actions.bet || actions.raise) && <div className="range-panel">
        <div className="range-panel__pot-buttons">
          <button className="btn range-panel__button range-panel__button--min" onClick={() => {
            setValue(minValue);
          }}>Min</button>
          <button className="btn range-panel__button range-panel__button--half-pot" disabled={(halfPotSum > maxValue) || (halfPotSum < minValue)} onClick={() => {
            setValue(halfPotSum);
          }}>{isPot ? '1/2 Pot' : '2 blind'}</button>
          <button className="btn range-panel__button range-panel__button--pot" disabled={(potSum > maxValue) || (potSum < minValue)} onClick={() => {
            setValue(potSum);
          }}>{isPot ? 'Pot' : '4 blind'}</button>
          <button className="btn range-panel__button range-panel__button--max" onClick={() => {
             setValue(maxValue);
          }}>Max</button>
        </div>

        <div className="range-panel__wrapper">
          <span className="range-panel__range-value">{value}</span>
          <button className="btn range-panel__range-button range-panel__range-button--minus" onClick={() => {
            setValue((last) => {
              if(last - 50 < minValue) {
                return minValue;
              }
              return last - 50;
            })
          }}>-</button>

          <div className="range-panel__container">

            <div className="range-panel__slider">
              <div className="range-panel__progress"></div>
            </div>

            <div className="range-panel__range-container">
              <input className="range-panel__input-range" type="range" min={minValue} max={maxValue} value={value} step={50}
              onChange={(e) => {
                setValue(e.target.valueAsNumber);
              }} />
            </div>

          </div>

          <button className="btn range-panel__range-button range-panel__range-button--plus"  onClick={() => {
           setValue((last) => {
            if(last + 50 > maxValue) {
              return maxValue;
            }
            return last + 50;
          })
          }}>+</button>
        </div>
      </div>}
    </div>
  )
}