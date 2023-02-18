import React from "react";
import '../../style.css';
import './empty-place.css';

type EmptyPlaceProps = {
  place: number;
}

export default function EmptyPlace({place}: EmptyPlaceProps) {
  return (
    <div className={`empty-place tp${place}`}>
      <button className="btn empty-place__button">Take the place</button>
    </div>
  )
}