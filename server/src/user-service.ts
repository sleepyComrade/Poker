import { connection } from "websocket";
import { User } from './user';

export class UserService {
  users: User[];
  bonusTime: number;
  connections: Map<connection, User>;
  constructor() {
    this.users = [];
    this.bonusTime = 10000;
    this.connections = new Map();
  }

  handleMessage(connection: connection, data: { type: string, data: any }, id: string) {
    const authorizeUser = (name: string, type: string, password: string) => {
      const reqeustedUser = this.users.filter(user => user.userName === name);
      switch (type) {
        case 'login':
          if (reqeustedUser.length) {
            if (reqeustedUser[0].password === password) {
              this.connections.set(connection, reqeustedUser[0]);
              connection.sendUTF(JSON.stringify({
                requestId: id,
                type: 'privateMessage',
                data: {
                  status: 'login',
                  id: reqeustedUser[0].id,
                  userName: reqeustedUser[0].userName,
                  chips: reqeustedUser[0].chips,
                  lastBonusTime: this.bonusTime - (Date.now() - reqeustedUser[0].lastBonusTime),
                }
              }));
              this.sendUpdatedUser(connection, this.users.indexOf(reqeustedUser[0]));
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
            this.users.push(new User(name, this.users.length, password, connection));
            this.connections.set(connection, this.users[this.users.length - 1]);
            connection.sendUTF(JSON.stringify({
              type: 'privateMessage',
              requestId: id,
              data: {
                status: 'registered',
                id: this.users[this.users.length - 1].id,
                userName: this.users[this.users.length - 1].userName,
                chips: this.users[this.users.length - 1].chips,
                lastBonusTime: this.bonusTime - (Date.now() - this.users[this.users.length - 1].lastBonusTime),
              }
            }));
            this.sendUpdatedUser(connection, this.users.length - 1);
          }
          break;
        default:
          break;
      }
    }
    if (data.type === 'bonus') {
      if ((Date.now() - this.users[data.data.id].lastBonusTime) >= this.bonusTime) {
        this.users[data.data.id].chips += 6000;
        this.users[data.data.id].lastBonusTime = Date.now();
        connection.sendUTF(JSON.stringify({
          type: 'privateMessage',
          requestId: id,
          data: {
            status: 'updated',
            lastBonusTime: this.bonusTime - (Date.now() - this.users[data.data.id].lastBonusTime),
            chips: this.users[data.data.id].chips
          }
        }));
        this.sendUpdatedUser(connection, data.data.id);
      } else {
        connection.sendUTF(JSON.stringify({
          type: 'privateMessage',
          requestId: id,
          data: {
            status: 'error',
          }
        }));
      }
    } else {
      authorizeUser(data.data.name, data.type, data.data.password);
    }
  }

  sendUpdatedUser(connection: connection, id: number) {
    connection.sendUTF(JSON.stringify({
      type: 'userUpdate',
      data: this.getUserData(id)
    }))
  }

  sendPrivateUpdatedUser(connection: connection, id: number, requestId: number) {
    connection.sendUTF(JSON.stringify({
      type: 'privateMessage',
      requestId: requestId,
      data: this.getUserData(id)
    }))
  }

  getUserData(id: number) {
    return {
      id: this.users[id].id,
      userName: this.users[id].userName,
      chips: this.users[id].chips,
      lastBonusTime: this.bonusTime - (Date.now() - this.users[id].lastBonusTime),
    }
  }

  getUserByConnection(connection: connection) {
    return this.connections.get(connection);
  }
}