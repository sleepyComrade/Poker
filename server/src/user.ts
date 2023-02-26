import { connection } from 'websocket';
import { IUserData } from '../../interfaces/IUser';

class UserData {
  chips: number
  userName: string
  id: number
  password: string
  avatarUrl: string
  lastBonusTime: number
  
  constructor(userName: string, id: number, password: string, avatarUrl: string, lastBonusTime?: number, chips?: number) {
    this.userName = userName
    this.lastBonusTime = Date.now() || lastBonusTime;
    this.id = id
    this.password = password
    this.avatarUrl = avatarUrl || "https://ps.w.org/primary-cat/assets/icon-256x256.jpg?rev=2450877?q=1677317775205" 
    this.chips = chips || 10_000
  }
}

export class User {
  connection: connection;
  bonusTime: number;
  userData: UserData
  onUpdate: (newUserData: IUserData) => void

  constructor(name: string, id: number, password: string, connection: connection, avatarUrl?: string, lastBonusTime?: number, chips?: number) {
    this.userData = new UserData(name, id, password, avatarUrl, lastBonusTime, chips)
    this.connection = connection;
    this.bonusTime = 10000;
  }

  private sendUpdate() {
    const data = this.getUserData()
    this.connection.sendUTF(JSON.stringify({
      type: 'userUpdate',
      data,
    }))
    this.onUpdate(data)
  }

  minusChips(chips: number) {
    if (this.userData.chips >= chips) {
      this.userData.chips -= chips;
      this.sendUpdate();
      return true;
    }
    return false;
  }

  plusChips(chips: number) {
    this.userData.chips += chips;
    this.sendUpdate();
  }
  
  changeAvatar(newAvatarUrl: string) {
    this.userData.avatarUrl = newAvatarUrl
    this.sendUpdate()
  }

  private getUserData(): IUserData  {
    const q = {
      id: this.userData.id,
      userName: this.userData.userName,
      chips: this.userData.chips,
      lastBonusTime: this.bonusTime - (Date.now() - this.userData.lastBonusTime),
      avatarUrl: this.userData.avatarUrl + `?q=${Date.now()}`,
    }
    
    return q
  }
}
