import { connection } from 'websocket';
import { IUserData } from '../../interfaces/IUser';

export class User {
  id: number;
  userName: string;
  chips: number;
  lastBonusTime: number;
  password: string;
  connection: connection;
  bonusTime: number;
  avatarUrl: string

  constructor(name: string, id: number, password: string, connection: connection) {
    this.avatarUrl = "https://ps.w.org/primary-cat/assets/icon-256x256.jpg?rev=2450877" 
    this.userName = name;
    this.id = id;
    this.chips = 10000;
    this.lastBonusTime = Date.now();
    this.password = password;
    this.connection = connection;
    this.bonusTime = 10000;
  }

  private sendUpdate() {
    this.connection.sendUTF(JSON.stringify({
      type: 'userUpdate',
      data: this.getUserData()
    }))
  }

  minusChips(chips: number) {
    if (this.chips >= chips) {
      this.chips -= chips;
      this.sendUpdate();
      return true;
    }
    return false;
  }

  plusChips(chips: number) {
    this.chips += chips;
    this.sendUpdate();
  }
  
  changeAvatar(newAvatarUrl: string) {
    this.avatarUrl = newAvatarUrl
    this.sendUpdate()
  }

  private getUserData() {
    return {
      id: this.id,
      userName: this.userName,
      chips: this.chips,
      lastBonusTime: this.bonusTime - (Date.now() - this.lastBonusTime),
      avatarUrl: this.avatarUrl + `?q=${Date.now()}`,
    }
  }
}
