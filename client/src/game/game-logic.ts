import { IPlayer, ICard, Round, IGameMessage, IBank, IDataWinner, IDataWinnerLegacy } from '../interfaces';
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
  currentPlayerIndex: number;
  minimalBet: number;
  lastInRoundIndex: number;
  currentRound: Round;
  myPlayerIndex: number;
  onMessage: (message: IGameMessage<any>) => void;
  banks: IBank[];

  constructor(players: IPlayer[], originDeck: ICard[], dealerIndex: number) {
    this.players = players;
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
    this.dealerIndex = dealerIndex;
    this.initialIndex = this.setInitialIndex(3);
    this.currentPlayerIndex = this.initialIndex;
    this.minimalBet = 100;
    this.banks = [];
    this.lastInRoundIndex = this.currentPlayerIndex;
    this.setLastPlayer(this.lastInRoundIndex);
    this.currentRound = Round.Preflop;
    this.myPlayerIndex = 0;

    // this.shuffleCards(this.deck);
    this.players.forEach(player => {
      if (!player.isAbsent) {
        player.cards.push(this.deck.pop());
        player.cards.push(this.deck.pop());
      }
    })

    const smallBlindIndex = this.players.filter(player => !player.isAbsent).length > 2 ?
                            this.setNextIndex(this.dealerIndex) : this.dealerIndex;
    const bigBlindIndex = this.players.filter(player => !player.isAbsent).length > 2 ? 
                          this.setNextIndex(smallBlindIndex) : this.setNextIndex(this.dealerIndex);

    this.setBlinds(smallBlindIndex, bigBlindIndex);

    setTimeout(() => {
      this.sendState("start")
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

  private setBlinds(small: number, big: number) {
    this.players[small].bet = this.minimalBet / 2;
    this.players[small].chips -= this.minimalBet / 2;
    this.players[big].bet = this.minimalBet;
    this.players[big].chips -= this.minimalBet;
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

  private setInitialIndex(startNum: number) {
    const initialIndex = this.players.length === 2 ?
                         this.dealerIndex :
                         (this.dealerIndex + startNum) % this.players.length;
    const getNextIndex = (cur: number) => (cur +  1) % this.players.length;
    const getNewInitialIndex = (last: number): number => this.players[getNextIndex(last)].isFold ||
                                                         this.players[getNextIndex(last)].isAllIn ?
                                                         getNewInitialIndex(getNextIndex(last)) :
                                                         getNextIndex(last);
    return this.players[initialIndex].isFold || this.players[initialIndex].isAllIn ?
           getNewInitialIndex(initialIndex) : initialIndex;
  }

  private setNextIndex(index: number) {
    const getNextIndex = (cur: number) => (cur +  1) % this.players.length;
    const getNewInitialIndex = (last: number): number => this.players[getNextIndex(last)].isFold ||
                                                         this.players[getNextIndex(last)].isAllIn ?
                                                         getNewInitialIndex(getNextIndex(last)) :
                                                         getNextIndex(last);
    return getNewInitialIndex(index);
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
      if (this.players.every(player => player.isFold || player.chips === 0 || player.isAllIn)) {
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
      const sum = this.players.reduce((a, b) => a + b.bet, 0);
      this.pot = this.pot + sum;
      this.players.forEach(player => player.bet = 0);
      this.onMessage({type: 'winner', data: {winIndex: this.players.findIndex(player => !player.isFold), cards:[], count: this.pot}});
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
      if (round === Round.Preflop) {
        this.tableCards = [...this.tableCards, this.deck.pop(), this.deck.pop(), this.deck.pop()];
      } else {
        this.tableCards = [...this.tableCards, this.deck.pop()];
      }
      this.sendState('round');
      if (this.players.every(player => player.isFold || player.isAllIn)) {
        setTimeout(() => {
          this.setNextRound();
        }, 1000);
        return;
      }
      const initialIndex = this.setInitialIndex(1);
      this.currentPlayerIndex = initialIndex;
      this.setLastPlayer(initialIndex);
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
      const realCards: ICard[] = wins[winIndex].h.cards.map(card=>{
        return {
          value: card.value + 1,
          type: ['a', 'b', 'c', 'd'] .indexOf(card.type) + 1
        }
      })
      console.log(`${leftPlayers[winIndex].name} won this game with ${wins[winIndex].h.type}!`, wins[winIndex].h.cards, realCards);
      console.log(leftP);
      console.log(tableC);
      const playerIndex = this.players.findIndex(player => player.name == leftPlayers[winIndex].name);
      const winners = getWinners(this.players, this.tableCards, this.banks)
      this.onMessage({type: 'winner', data: {winIndex: playerIndex, cards: realCards, comboName: wins[winIndex].h.type, count: this.pot, winners: winners}});
      this.banks = [];
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
    } else if(this.getCallChips() > 0 &&
              this.getCallChips() >= this.players[this.currentPlayerIndex].chips) {
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
      ...this.getState()
    }})
  }

  getState(){
      return {
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
      }
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

function split(players: Array<IPlayer>){
  const res: Array<IBank> = [];
  const sorted = [...players].sort((a,b)=>a.bet-b.bet);
  console.log(sorted);
  sorted.forEach(it=>{
      const pls:Array<IPlayer> = [];
      const ib = it.bet;
      const bank = sorted.reduce((ac, jt)=> {
          // console.log(it.bet, jt.bet)
          
          if (jt.bet>0){
              const next = ac + ib;
              jt.bet -= ib;
              pls.push(jt);
            return next;
          }
          if (jt.isFold){
              pls.push(jt);
          }
          return ac
      }, 0)
      if (bank >0){
          if(res.length && pls.length == res[res.length-1].players.length){
              res[res.length -1].bank +=bank;
          } else {
              res.push({bank, players: pls});
          }
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
function getBankWinners(allPlayers: IPlayer[], players: IPlayer[], tableCards: ICard[], pot:number){
  const types = ['a', 'b', 'c', 'd'];
  const convert = (card: ICard) => values[card.value - 1] + types[card.type - 1];//String.fromCharCode(96 + card.type);
  const leftPlayers = players.filter(player => !player.isFold);
  const leftP = players.filter(player => !player.isFold).map(player => [convert(player.cards[0]), convert(player.cards[1])]);
  const tableC = tableCards.map(card => convert(card));
  const wins = getWinner(leftP, tableC);
  const winsVals = wins.map(win => win.val);
  const winIndex = winsVals.indexOf(Math.max(...winsVals));
  console.log(getWinner(leftP, tableC));
  console.log(leftPlayers);

  const getRealCards = (cards:Array<any>) => {
    const realCards: ICard[] = cards.map(card=>{
      return {
        value: card.value + 1,
        type: types.indexOf(card.type) + 1
      }
    })
    return realCards;
  }

  const winnerOne = wins[winIndex];
  const winnerDatas = wins.map((winner, index) => {
    if (winner.val == winnerOne.val){
      return {
        winnerData: winner,
        winnerPlayer: leftPlayers[index]
      }
    }
  }).filter(_=>_);

  const winners: Array<IDataWinnerLegacy & {player: IPlayer}> = winnerDatas.map(wd=>{
    return {
      player: players.find(player => player && (player.name == wd.winnerPlayer.name)),
      winIndex: allPlayers.findIndex(player => player && (player.name == wd.winnerPlayer.name)),
      cards: getRealCards(wd.winnerData.h.cards), 
      comboName: wd.winnerData.h.type, 
      count: Math.floor(pot / winnerDatas.length)
    }
  })
  console.log('all winners ', winners);
  return winners;
}

function getWinners(players: IPlayer[], tableCards: ICard[], banks: IBank[]){
  const winners: (IDataWinnerLegacy & {player: IPlayer})[] = [];
  banks.forEach(bank=>{
    const bankWinners = getBankWinners(players, bank.players, tableCards, bank.bank);
    bankWinners.forEach(it=>{
      const exWinner = winners.find(jt=> jt.player == it.player)
      if (exWinner){
        exWinner.count += it.count;
      } else {
        winners.push(it);
      }
    })
  })

  return winners;
}