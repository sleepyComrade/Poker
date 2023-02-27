import React from "react";
import '../../style.css';
import './empty-place.css';

type EmptyPlaceProps = {
  place: number;
  onClick: () => void;
}

export default function EmptyPlace({place, onClick}: EmptyPlaceProps) {
  return (
    <div className={`empty-place tp${place}`}>
      <button className="btn empty-place__button" onClick={() => {onClick()}}>Take the place</button>
    </div>
  )
}