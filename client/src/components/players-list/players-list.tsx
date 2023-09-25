import React, { useEffect, useState } from "react";
import Player from '../player/player';
import EmptyPlace from '../empty-place/empty-place';
import MainPlayer from '../main-player/main-player';
import BankCoin from '../bank-coin/bank-coin';
import { ICard, IPlayer } from "../../interfaces";
import '../../style.css';
import './players-list.css';

type PlayersListProps = {
  players: Array<IPlayer>;
  player: IPlayer;
  currentPlayer: IPlayer;
  isOpened: boolean;
  winner: IPlayer | null;
  winCards: Array<ICard> | null;
  dealer: IPlayer;
  onClick: (index: number) => void;
  askId: number | null;
}

export default function PlayersList({ players, player, currentPlayer, isOpened, winner, winCards, dealer, onClick, askId }: PlayersListProps) {  
  return (
    <div className="players-list">

      {players.map((_player, index) => {
        if (_player == player) {
          return <MainPlayer askId={askId} player={player} place={index + 1} isCurrent={player == currentPlayer} isWinner={player == winner} winCards={winCards} isDealer={player == dealer} />
        }

        return (
          (_player.isAbsent && !player) ? <EmptyPlace onClick={() => onClick(index)} place={index + 1} /> :
            <Player askId={askId} key={index} player={_player} place={index + 1} isCurrent={_player == currentPlayer} isOpened={isOpened} isWinner={_player == winner}
              winCards={winCards} isDealer={_player == dealer} />
        )
      }
      )}

    </div>
  )
}