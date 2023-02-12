import { connection } from "websocket";
import { IUserData } from '../../interfaces/IUser';
import { User } from './user';

export class UserService {
  users: IUserData[];
  constructor() {
    this.users = [];
  }

  handleMessage(connection: connection, data: { type: string, data: any }, id: number) {
    const user = new User(data.data.name, id, data.data.password);
    // if ()
    this.users.push(user);
  }
}