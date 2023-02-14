import { IUserData } from '../../interfaces/IUser';

export class User {
  id: number;
  userName: string;
  chips: number;
  lastBonusTime: number;
  password: string;

  constructor(name: string, id: number, password: string) {
    this.userName = name;
    this.id = id;
    this.chips = 10000;
    this.lastBonusTime = Date.now();
    this.password = password;
  }
}