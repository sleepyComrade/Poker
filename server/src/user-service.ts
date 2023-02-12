import { connection } from "websocket";
import { IUserData } from '../../interfaces/IUser';
import { User } from './user';

export class UserService {
  users: IUserData[];
  constructor() {
    this.users = [];
  }

  handleMessage(connection: connection, data: { type: string, data: any }, id: number) {
    const authorizeUser = (name: string, password: string) => {
      const isName = this.users.filter(user => user.userName === name);
      if (isName.length) {
        
      } else {
        if (isName[0].password === password) {
          
        } else {
          this.users.push(new User(name, id, password));

        }
      }
    }
    authorizeUser(data.data.name, data.data.password);
  }
}