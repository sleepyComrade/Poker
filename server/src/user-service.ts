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
      const reqeustedUser = this.users.filter(user => user.userData.userName === name);
      switch (type) {
        case 'login':
          console.log('connections!!!!!!!!!!!!', this.connections);
          
          if (reqeustedUser.length) {
            if (reqeustedUser[0].userData.password === password) {
              reqeustedUser[0].connection = connection;
              this.connections.set(connection, reqeustedUser[0]);
              connection.sendUTF(JSON.stringify({
                requestId: id,
                type: 'privateMessage',
                data: {
                  status: 'login',
                  id: reqeustedUser[0].userData.id,
                  userName: reqeustedUser[0].userData.userName,
                  chips: reqeustedUser[0].userData.chips,
                  lastBonusTime: this.bonusTime - (Date.now() - reqeustedUser[0].userData.lastBonusTime),
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
                id: this.users[this.users.length - 1].userData.id,
                userName: this.users[this.users.length - 1].userData.userName,
                chips: this.users[this.users.length - 1].userData.chips,
                lastBonusTime: this.bonusTime - (Date.now() - this.users[this.users.length - 1].userData.lastBonusTime),
              }
            }));
            this.sendUpdatedUser(connection, this.users.length - 1);
          }
          break;
        case 'logout': {
          this.connections.delete(connection);
          connection.sendUTF(JSON.stringify({
            type: 'privateMessage',
            requestId: id,
            data: {}
          }));
        }
        default:
          break;
      }
    }
    if (data.type === 'bonus') {
      if ((Date.now() - this.users[data.data.id].userData.lastBonusTime) >= this.bonusTime) {
        this.users[data.data.id].userData.chips += 6000;
        this.users[data.data.id].userData.lastBonusTime = Date.now();
        connection.sendUTF(JSON.stringify({
          type: 'privateMessage',
          requestId: id,
          data: {
            status: 'updated',
            lastBonusTime: this.bonusTime - (Date.now() - this.users[data.data.id].userData.lastBonusTime),
            chips: this.users[data.data.id].userData.chips
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
      if (data.data.name.includes(" ")) {
        return
      }
      authorizeUser(data.data.name, data.type, data.data.password);
    }
  }

  handleDisconnect(connection: connection) {
    this.connections.delete(connection);
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
      id: this.users[id].userData.id,
      userName: this.users[id].userData.userName,
      chips: this.users[id].userData.chips,
      lastBonusTime: this.bonusTime - (Date.now() - this.users[id].userData.lastBonusTime),
      avatarUrl: this.users[id].userData.avatarUrl,
    }
  }

  getUserByConnection(connection: connection) {
    return this.connections.get(connection);
  }
}
