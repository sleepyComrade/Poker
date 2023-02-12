import { connection } from "websocket";
import { User } from './user';

export class UserService {
  users: User[];
  constructor() {
    this.users = [];
  }

  handleMessage(connection: connection, data: { type: string, data: any }, id: string) {
    const authorizeUser = (name: string, type: string, password: string) => {
      const reqeustedUser = this.users.filter(user => user.userName === name);
      switch (type) {
        case 'login':
          if (reqeustedUser.length) {
            if (reqeustedUser[0].password === password) {
              connection.sendUTF(JSON.stringify({
                requestId: id,
                type: 'privateMessage', 
                data: {
                  status: 'login',
                  id: reqeustedUser[0].id,
                  userName: reqeustedUser[0].userName,
                  chips: reqeustedUser[0].chips,
                  lastBonusTime: reqeustedUser[0].lastBonusTime,
                }
              }));
            } else {
              connection.sendUTF(JSON.stringify({
                requestId: id,
                type: 'privateMessage', 
                data: {
                  status: 'Wrong password'
                }
              }));
            }
          } else {
            connection.sendUTF(JSON.stringify({
              requestId: id,
              type: 'privateMessage',
              data: {
                status: 'Try to register'
              }
            }));
          }
          break;
        case 'register':
          if (reqeustedUser.length) {
            connection.sendUTF(JSON.stringify({
              type: 'privateMessage',
              requestId: id,
              data: {
                status: 'Try to login'
              }
            }));
          } else {
            this.users.push(new User(name, this.users.length, password));
            connection.sendUTF(JSON.stringify({
              type: 'privateMessage',
              requestId: id,
              data: {
                status: 'registered',
                id: this.users[this.users.length - 1].id,
                userName: this.users[this.users.length - 1].userName,
                chips: this.users[this.users.length - 1].chips,
                lastBonusTime: this.users[this.users.length - 1].lastBonusTime,
              }
            }));
          }
        break;
        default:
          break;
      }
    }
    authorizeUser(data.data.name, data.type, data.data.password);
  }
}