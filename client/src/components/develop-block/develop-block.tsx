import React, { useEffect, useState } from "react";
import '../../style.css';
import './develop-block.css';
import githubProfileIcon from '../../assets/github.svg';

export default function DevelopBlock() {
  const [openDev, setOpenDev] = useState(false);

  return (
    <div className="develop-block">
      <div className="develop-block__wrapper">
        <div className={`develop-block__links ${openDev ? 'develop-block__links--active' : ''}`}>
          <a className="develop-block__link develop-block__link--sleepyComrade" href="https://github.com/sleepyComrade" target={"_blank"}></a>
          <a className="develop-block__link develop-block__link--ramitsan" href="https://github.com/Ramitsan" target={"_blank"}></a>
          <a className="develop-block__link develop-block__link--max-romanov" href="https://github.com/max-romanov" target={"_blank"}></a>
        </div>
        <button className={`btn develop-block__btn `}
          onClick={() => {
            !openDev ? setOpenDev(true) : setOpenDev(false);
          }}>Dev</button>
      </div>
    </div>

  )
}