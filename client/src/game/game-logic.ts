import { IPlayer, ICard, Round, IGameMessage, IBank } from '../interfaces';
import { getCombo} from './combinations';
import { getWinner, values } from './combo2';

// getCombo([]);
// console.log(getWinner([['4d', '5d'], ['6b', '7c'], ['1b', '2c']], ['2a', '2b', '5c', '2d', '3c']));

export class GameLogic {
  players: IPlayer[];
  pot: number;
  deck: ICard[];
  tableCards: ICard[];
  dealerIndex: number;
  initialIndex: number;
  currentPlayerIndex: any;
  minimalBet: number;
  lastInRoundIndex: number;
  currentRound: Round;
  myPlayerIndex: number;
  onMessage: (message: IGameMessage) => void;
  banks: IBank[];

  constructor(playerss: IPlayer[], originDeck: ICard[]) {
    this.players = playerss;
    this.pot = 0;
    // this.deck = [...originDeck];
    this.deck = [
      {
        type: 2,
        value: 5
      },
      {
        type: 1,
        value: 6
      },
      {
        type: 2,
        value: 13
      },
      {
        type: 2,
        value: 1
      },
      {
        type: 3,
        value: 13
      },
      {
        type: 3,
        value: 1
      },
      {
        type: 4,
        value: 13
      },
      {
        type: 4,
        value: 1
      },
      ...originDeck
    ].reverse();
    this.tableCards = [];
    this.dealerIndex = 0;
    this.initialIndex = this.players.length === 2 ?
                        this.dealerIndex :
                        (this.dealerIndex + 3) % this.players.length;
    this.currentPlayerIndex = this.initialIndex;
    this.minimalBet = 100;
    this.banks = [];
    this.lastInRoundIndex = (this.initialIndex - 1) % this.players.length >= 0 ?
                            (this.initialIndex - 1) % this.players.length :
                            this.players.length - 1;
    this.currentRound = Round.Preflop;
    this.myPlayerIndex = 0;

    // this.shuffleCards(this.deck);
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
      this.sendState('start');
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
    if (this.players.every(player => player.isFold || player.isAllIn)) {
      this.setNextRound();
      return;
    }
    const getPreviousIndex = (cur: number) => (cur - 1) % this.players.length >= 0 ?
                                              (cur - 1) % this.players.length :
                                              this.players.length - 1;
    const getNewLastInRoundIndex = (last: number): number => this.players[getPreviousIndex(last)].isFold ||
                                                             this.players[getPreviousIndex(last)].isAllIn ?
                                                             getNewLastInRoundIndex(getPreviousIndex(last)) :
                                                             getPreviousIndex(last);
    this.lastInRoundIndex = getNewLastInRoundIndex(currentIndex);
  }

  private setInitialIndex() {
    const initialIndex = this.players.length === 2 ?
                         this.dealerIndex :
                         (this.dealerIndex + 1) % this.players.length;
    const getNextIndex = (cur: number) => (cur +  1) % this.players.length;
    const getNewInitialIndex = (last: number): number => this.players[getNextIndex(last)].isFold ||
                                                         this.players[getNextIndex(last)].isAllIn ?
                                                         getNewInitialIndex(getNextIndex(last)) :
                                                         getNextIndex(last);
    return this.players[initialIndex].isFold || this.players[initialIndex].isAllIn ?
           getNewInitialIndex(initialIndex) : initialIndex;
  }

  private getRaiseRange() {
    return {min: this.getCallChips() + this.minimalBet, max: this.players[this.currentPlayerIndex].chips}
  }

  private getCallChips() {
    return Math.max(...this.players.map(player => player.bet)) - this.players[this.currentPlayerIndex].bet;
  }

  private defineBet = (bet: string) => {
    this.protectFoldedAction();
    const chipsToBet = this.getRaiseRange().min;
    if (chipsToBet < this.players[this.currentPlayerIndex].chips) {
      this.players[this.currentPlayerIndex].bet += chipsToBet;
      this.players[this.currentPlayerIndex].chips -= chipsToBet;
      // if (bet === 'raise') {
        // this.currentBet += chipsToBet;
      // } else {
        // this.currentBet += chipsToBet;
        // this.currentRaise = chipsToBet;
      // }
      this.setLastPlayer(this.currentPlayerIndex);
      // this.onMessage({type: bet, data: {chipsToBet, currentBet: this.currentBet, playerId: this.currentPlayerIndex}});
      this.sendState(bet);
      if (this.players.every(player => player.isFold || player.chips === 0 || player.isAllIn)) {
        this.setNextRound();
      } else {
        this.setNextPlayer();
      }
    } else {
      this.players[this.currentPlayerIndex].bet += this.players[this.currentPlayerIndex].chips;
      this.players[this.currentPlayerIndex].chips = 0;
      this.players[this.currentPlayerIndex].isAllIn = true;
      this.sendState('all-in');
      console.log('all-in');
      if (this.players.every(player => player.isFold || player.chips === 0)) {
        this.setNextRound();
        console.log(this.players);
      } else {
        this.setNextPlayer();
      }
    }
  }

  private call = () => {
    const chipsToBet = this.getCallChips();
    if (chipsToBet >= this.players[this.currentPlayerIndex].chips) {
      this.players[this.currentPlayerIndex].bet += this.players[this.currentPlayerIndex].chips;
      this.players[this.currentPlayerIndex].chips = 0;
      this.players[this.currentPlayerIndex].isAllIn = true;
      this.sendState('all-in');
      console.log('all-in');
    } else {
      this.players[this.currentPlayerIndex].bet += chipsToBet;
      this.players[this.currentPlayerIndex].chips -= chipsToBet;
      this.sendState('call');
      console.log('call');
    }
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
      this.onMessage({type: 'winner', data: {winIndex: this.players.findIndex(player => !player.isFold)}});
      return;
    }
    if (this.currentPlayerIndex === this.lastInRoundIndex) {
      const maxBet = Math.max(...this.players.map(player => player.bet));
      if (this.players.every(player => player.isFold || player.bet === maxBet || player.isAllIn)) {
        this.sendState('fold');
        this.setNextRound();
        return;
      }
      this.setLastPlayer(this.currentPlayerIndex);
    }
    this.sendState('fold');
    this.setNextPlayer();
    console.log('fold');
  }

  private setNextRound() {
    const sum = this.players.reduce((a, b) => a + b.bet, 0);
    if (sum) {
      const banks = split(this.players);
      this.banks = mergeBanks(this.banks, banks);
      console.log(banks);
      console.log(this.banks);
      this.pot = this.pot + sum;
    }
    const round = this.currentRound;
    if (round === Round.Preflop) this.currentRound = Round.Flop;
    if (round === Round.Flop) this.currentRound = Round.Turn;
    if (round === Round.Turn) this.currentRound = Round.River;
    if (round !== Round.River) {
      const initialIndex = this.setInitialIndex();
      this.currentPlayerIndex = initialIndex;
      this.setLastPlayer(initialIndex);
      if (round === Round.Preflop) {
        this.tableCards = [...this.tableCards, this.deck.pop(), this.deck.pop(), this.deck.pop()];
      } else {
        this.tableCards = [...this.tableCards, this.deck.pop()];
      }
      this.sendState('round');
      if (this.players.every(player => player.isFold || player.isAllIn)) {
        this.setNextRound();
        return;
      }
      this.onMessage({type: 'ask', data: {actions: this.getActions(), playerId: this.currentPlayerIndex}});
    } else {
      console.log('Get Winner');
      this.sendState('finish');
      const convert = (card: ICard) => values[card.value - 1] + String.fromCharCode(96 + card.type);
      const leftPlayers = this.players.filter(player => !player.isFold);
      const leftP = this.players.filter(player => !player.isFold).map(player => [convert(player.cards[0]), convert(player.cards[1])]);
      const tableC = this.tableCards.map(card => convert(card));
      const wins = getWinner(leftP, tableC);
      const winsVals = wins.map(win => win.val);
      let winIndex = winsVals.indexOf(Math.max(...winsVals));
      console.log(getWinner(leftP, tableC));
      console.log(leftPlayers);
      console.log(`${leftPlayers[winIndex].name} won this game with ${wins[winIndex].h.type}!`);
      console.log(leftP);
      console.log(tableC);
      const playerIndex = this.players.findIndex(player => player.name == leftPlayers[winIndex].name);
      this.onMessage({type: 'winner', data: {winIndex: playerIndex}});
    }
  }

  private getActions() {
    if (this.currentPlayerIndex === this.lastInRoundIndex && this.getCallChips() === 0) {
      return {
        bet: this.bet,
        check: () => {
          if (this.currentRound === Round.Flop) console.log('Turn');
          if (this.currentRound === Round.Turn) console.log('River');
          this.setNextRound();
        }
      }
    } else if (!this.getCallChips()) {
      return {
        bet: this.bet,
        check: () => {
          this.sendState('check');
          this.setNextPlayer();
        },
      }
    } else if (this.currentPlayerIndex === this.lastInRoundIndex && this.getCallChips() === 0) {
      return {
        raise: this.raise,
        check: () => {
          if (this.currentRound === Round.Preflop) console.log('Flop');
          if (this.currentRound === Round.Flop) console.log('Turn');
          if (this.currentRound === Round.Turn) console.log('River');
          this.setNextRound();
        }
      }
    } else if (this.currentPlayerIndex === this.lastInRoundIndex && this.getCallChips() > 0) {
      return {
        fold: this.fold,
        call: () => {
          this.call();
          const maxBet = Math.max(...this.players.map(player => player.bet));
          if (this.players.every(player => player.isFold || player.bet === maxBet || player.isAllIn)) {
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
    } else if (this.getCallChips() > 0) {
      return {
        fold: this.fold,
        call: () => {
          this.call();
          this.setNextPlayer();
        },
        raise: this.raise
      }
    } else if (this.getCallChips() === 0) {
      return {
        check: () => {
          this.sendState('check1');
          this.setNextPlayer();
        },
        raise: this.raise
      }
    } else {
      
      console.log('Undefined Error ', this);
    }
  }

  private sendState(move: string) {
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
      lastInRoundIndex: this.lastInRoundIndex,
      currentRound: this.currentRound,
      myPlayerIndex: this.myPlayerIndex
    }})
  }

  private setNextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    if (this.players.every(player => player.isFold || player.chips === 0 || player.isAllIn)) {
      this.setNextRound();
    } else if (this.players[this.currentPlayerIndex].isFold || this.players[this.currentPlayerIndex].isAllIn) {
      this.setNextPlayer();
    } else this.onMessage({type: 'ask', data: {actions: this.getActions(), playerId: this.currentPlayerIndex}});
  }

  private protectFoldedAction(){
    if (this.players[this.currentPlayerIndex].isFold){
      throw new Error(`folded action, player ${this.currentPlayerIndex}`);
    }
  }

  destroy() {

  }
}

function split(players: IPlayer[]){
  const res: IBank[] = [];
  const sorted = [...players].sort((a,b)=>a.bet-b.bet);
  console.log(sorted);
  sorted.forEach(it=>{
      const pls: IPlayer[] = [];
      const ib = it.bet;
      const bank = sorted.reduce((ac, jt)=> {
          // console.log(it.bet, jt.bet)
          const next = ac + ib;
          if (jt.bet > 0){
              jt.bet -= ib;
              pls.push(jt);
          }
          return next;
      }, 0);
      if (bank > 0){
          res.push({bank, players: pls});
      }
  })
  return res;
}

// console.log(split([{id:1, bet:1}, {id:2, bet:10}, {id:3, bet:30}, {id:4, bet:100}, {id:5, bet:100} ]));

function mergeBanks(currentBanks: IBank[], newBanks: IBank[]){
  if (newBanks.length === 0) return currentBanks;
  if (currentBanks.length){
      const item = currentBanks[currentBanks.length-1];
      if (item.players.length == newBanks[0].players.length){
          item.bank += newBanks[0].bank;
          newBanks.shift();
      }
  }
  return [...currentBanks, ...newBanks]
}
//сurrentBanks = mergeBanks(
// mergeBanks([], [{bank:3, players:[{}, {}]}, {bank:10, players:[{}]}])
// mergeBanks([], {bank:10, players:[{}, {}]}], [{bank:3, players:[{}, {}]}, {bank:10, players:[{}]}])
