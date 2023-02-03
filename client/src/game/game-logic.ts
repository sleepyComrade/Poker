import { IPlayer, ICard, Round, IGameMessage } from '../interfaces';

export class GameLogic {
  players: IPlayer[];
  pot: number;
  deck: ICard[];
  tableCards: ICard[];
  dealerIndex: number;
  initialIndex: number;
  currentPlayerIndex: any;
  minimalBet: number;
  currentBet: number;
  lastInRoundIndex: number;
  currentRound: Round;
  myPlayerIndex: number;
  onMessage: (message: IGameMessage) => void;

  constructor(playerss: IPlayer[], originDeck: ICard[]) {
    this.players = playerss;
    this.pot = 0;
    this.deck = [...originDeck];
    this.tableCards = [];
    this.dealerIndex = 0;
    this.initialIndex = this.players.length === 2 ?
                        this.dealerIndex :
                        (this.dealerIndex + 3) % this.players.length;
    this.currentPlayerIndex = this.initialIndex;
    this.minimalBet = 100;
    this.currentBet = this.minimalBet;
    this.lastInRoundIndex = (this.initialIndex - 1) % this.players.length >= 0 ?
                            (this.initialIndex - 1) % this.players.length :
                            this.players.length - 1;
    this.currentRound = Round.Preflop;
    this.myPlayerIndex = 0;

    this.shuffleCards(this.deck);
    this.players.forEach(player => {
      player.cards.push(this.deck.pop());
      player.cards.push(this.deck.pop());
    })

    this.players.forEach((player, i) => {
      if (this.players.length > 2) {
        this.setBlinds(player, i, 1, 2);
      }
      if (this.players.length === 2) {
        this.setBlinds(player, i, 0, 1);
      }
    })

    setTimeout(() => {
      this.onMessage({type: 'ask', data: {actions: this.getActions(), playerId: this.currentPlayerIndex}});
    }, 0);
  }

  private shuffleCards(deck: ICard[]) {
    for (let i = deck.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * i);
      let temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }
  }

  private setBlinds(player: IPlayer, index: number, small: number, big: number) {
    if (index === (this.dealerIndex + small) % this.players.length) {
      player.bet = this.minimalBet / 2;
      player.chips -= this.minimalBet / 2;
    }
    if (index === (this.dealerIndex + big) % this.players.length) {
      player.bet = this.minimalBet;
      player.chips -= this.minimalBet;
    }
  }

  private setLastPlayer(currentIndex: number) {
    const getPreviousIndex = (cur: number) => (cur - 1) % this.players.length >= 0 ?
                                              (cur - 1) % this.players.length :
                                              this.players.length - 1;
    const getNewLastInRoundIndex = (last: number): number => this.players[getPreviousIndex(last)].isFold ?
                                                             getNewLastInRoundIndex(getPreviousIndex(last)) :
                                                             getPreviousIndex(last);
    this.lastInRoundIndex = getNewLastInRoundIndex(currentIndex);
  }

  private defineBet = (bet: string) => {
    const chipsToBet = bet === 'raise' ?
                      (this.currentBet * 2) - this.players[this.currentPlayerIndex].bet :
                      this.minimalBet;
    this.players[this.currentPlayerIndex].bet += chipsToBet;
    this.players[this.currentPlayerIndex].chips -= chipsToBet;
    const currentIndex = this.currentPlayerIndex;
    if (bet === 'raise') {
      this.currentBet *= 2;
    } else {
      this.currentBet += chipsToBet;
    }
    this.setLastPlayer(currentIndex);
    // this.onMessage({type: bet, data: {chipsToBet, currentBet: this.currentBet, playerId: this.currentPlayerIndex}});
    this.sendState(bet);
    this.setNextPlayer();
  }

  private call = () => {
    const chipsToBet = this.currentBet - this.players[this.currentPlayerIndex].bet;
    // if () {
      
    // }
    this.players[this.currentPlayerIndex].bet += chipsToBet;
    this.players[this.currentPlayerIndex].chips -= chipsToBet;
    this.sendState('call');
    console.log('call');
  }

  private raise = () => {
    this.defineBet('raise');
    console.log('raise');
  }

  private bet = () => {
    this.defineBet('bet');
    console.log('bet');
  }

  private fold = () => {
    this.players[this.currentPlayerIndex].isFold = true;
    if (this.players.filter(el => !el.isFold).length === 1) {
      console.log('Start next game');
      return;
    }
    if (this.currentPlayerIndex === this.lastInRoundIndex) {
      const currentIndex = this.currentPlayerIndex;
      this.setLastPlayer(currentIndex);
    }
    this.sendState('fold');
    this.setNextPlayer();
    console.log('fold');
  }

  private setNextRound() {
    // const sum = this.players.reduce((a, b) => a + b.bet, 0);
    if (this.currentBet) {
      const banks = split(this.players);
      console.log(banks);
      const sum = banks[0].bank;
      this.pot = this.pot + sum;
    }
    // this.players = this.players.map(player => {
    //   player.bet = 0;
    //   return player;
    // });
    const round = this.currentRound;
    if (round === Round.Preflop) this.currentRound = Round.Flop;
    if (round === Round.Flop) this.currentRound = Round.Turn;
    if (round === Round.Turn) this.currentRound = Round.River;
    this.currentBet = 0;
    if (round !== Round.River) {
      const initialIndex = this.players.length === 2 ? this.dealerIndex : (this.dealerIndex + 1) % this.players.length;
      this.currentPlayerIndex = initialIndex;
      this.lastInRoundIndex = (initialIndex - 1) % this.players.length >= 0 ?
                              (initialIndex - 1) % this.players.length :
                              this.players.length - 1;
      if (round === Round.Preflop) {
        this.tableCards = [...this.tableCards, this.deck.pop(), this.deck.pop(), this.deck.pop()];
      } else {
        this.tableCards = [...this.tableCards, this.deck.pop()];
      }
      this.sendState('round');
      this.onMessage({type: 'ask', data: {actions: this.getActions(), playerId: this.currentPlayerIndex}});
    } else {
      console.log('Get Winner');
    }
  }

  private getActions() {
    if (this.currentPlayerIndex === this.lastInRoundIndex && !this.currentBet) {
      return {
        bet: this.bet,
        check: () => {
          if (this.currentRound === Round.Flop) console.log('Turn');
          if (this.currentRound === Round.Turn) console.log('River');
          this.setNextRound();
        }
      }
    } else if (!this.currentBet) {
      return {
        bet: this.bet,
        check: () => {
          this.sendState('check');
          this.setNextPlayer();
        },
      }
    } else if (this.currentPlayerIndex === this.lastInRoundIndex && this.currentBet === this.players[this.currentPlayerIndex].bet) {
      return {
        raise: this.raise,
        check: () => {
          if (this.currentRound === Round.Preflop) console.log('Flop');
          if (this.currentRound === Round.Flop) console.log('Turn');
          if (this.currentRound === Round.Turn) console.log('River');
          this.setNextRound();
        }
      }
    } else if (this.currentPlayerIndex === this.lastInRoundIndex && this.currentBet > this.players[this.currentPlayerIndex].bet) {
      return {
        fold: this.fold,
        call: () => {
          this.call();
          if (this.players.every(player => player.isFold || player.bet === this.currentBet)) {
            if (this.currentRound === Round.Preflop) console.log('Flop');
            if (this.currentRound === Round.Flop) console.log('Turn');
            if (this.currentRound === Round.Turn) console.log('River');
            this.setNextRound();
          } else {
            this.setNextPlayer();
          }
        },
        raise: this.raise
      }
    } else if (this.currentBet > this.players[this.currentPlayerIndex].bet) {
      return {
        fold: this.fold,
        call: () => {
          this.call();
          this.setNextPlayer();
        },
        raise: this.raise
      }
    } else if (this.currentBet === this.players[this.currentPlayerIndex].bet) {
      return {
        check: () => {
          this.sendState('check');
          this.setNextPlayer();
        },
        raise: this.raise
      }
    }
  }

  sendState(move: string) {
    this.onMessage({type: 'state', data: {
      move,
      players: this.players,
      pot: this.pot,
      deck: this.deck,
      tableCards: this.tableCards,
      dealerIndex: this.dealerIndex,
      initialIndex: this.initialIndex,
      currentPlayerIndex: this.currentPlayerIndex,
      minimalBet: this.minimalBet,
      currentBet: this.currentBet,
      lastInRoundIndex: this.lastInRoundIndex,
      currentRound: this.currentRound,
      myPlayerIndex: this.myPlayerIndex
    }})
  }

  setNextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    if (this.players[this.currentPlayerIndex].isFold) {
      this.setNextPlayer();
    } else this.onMessage({type: 'ask', data: {actions: this.getActions(), playerId: this.currentPlayerIndex}});
  }

  destroy() {

  }
}

function split(players: IPlayer[]){
  const res: {bank: number, players: IPlayer[]}[] = [];
  const sorted = [...players].sort((a,b)=>a.bet-b.bet);
  console.log(sorted);
  sorted.forEach(it=>{
      const pls: IPlayer[] = [];
      const ib = it.bet;
      const bank = sorted.reduce((ac, jt)=> {
          console.log(it.bet, jt.bet)
          const next = ac + ib;
          if (jt.bet>0){
              jt.bet -= ib;
              pls.push(jt);
          }
          return next;
      }, 0)
      if (bank >0){
          res.push({bank, players: pls});
      }
  })
  return res;
}

// console.log(split([{id:1, bet:1}, {id:2, bet:10}, {id:3, bet:30}, {id:4, bet:100}, {id:5, bet:100} ]));
