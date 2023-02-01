import React, { useEffect, useState } from "react";
import '../../style.css';
import './bank-coin.css';

type BankCoinProps = {
    topValue: number;
    leftValue: number;
}

export default function BankCoin({topValue, leftValue}: BankCoinProps) {
    return (
        <div className="bank-coin" style={{top: topValue, left: leftValue}}>
            <div className="bank-coin__inner">500</div>
        </div>
    )
}