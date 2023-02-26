import { connection } from "websocket";
import * as mongodb from "mongodb"
import { User } from './user';

export class UserService {
  users: User[];
  bonusTime: number;
  connections: Map<connection, User>;
  usersDb: mongodb.Collection<mongodb.Document>
  withDatabase: boolean
  
  constructor(withDatabase: boolean) {
    this.withDatabase = withDatabase
    const client = new mongodb.MongoClient("mongodb://127.0.0.1")
    // const client = new mongodb.MongoClient("mongodb+srv://maxromanov:psina@cluster0.sm1j0uh.mongodb.net/?retryWrites=true&w=majority")
    this.usersDb = client.db("mongo").collection("users")
    this.usersDb.find({}).toArray().then(console.log)
    this.users = [];
    this.bonusTime = 10000
    this.connections = new Map();
  }

  handleMessage(connection: connection, data: { type: string, data: any }, id: string) {
    const authorizeUser = async (name: string, type: string, password: string) => {
      const reqeustedUser = this.users.filter(user => user.userData.userName === name);
      const requestedUserDB = await this.usersDb.find({userName: name}).toArray()
      switch (type) {
        case 'login':
          // console.log('connections!!!!!!!!!!!!', this.connections);
          
          if (requestedUserDB.length) {
            if (requestedUserDB[0].password === password) {
              const [userDb] = requestedUserDB
              const user = new User(userDb.userName, userDb.id, userDb.password, connection, userDb.avatarUrl, userDb.lastBonusTime, userDb.chips)

              user.onUpdate = (newData) => {
                console.log("on update", newData)
                this.usersDb.updateOne({userName: user.userData.userName}, {$set: {...newData}}).then(res => {
                  this.usersDb.find().toArray().then(console.log)
                })
              }

              this.users.push(user)
              this.connections.set(connection, user);
              connection.sendUTF(JSON.stringify({
                requestId: id,
                type: 'privateMessage',
                data: {
                  status: 'login',
                  id: user.userData.id, 
                  userName: user.userData.userName,
                  chips: user.userData.chips,
                  lastBonusTime: user.userData.lastBonusTime,
                }
              }));
              this.sendUpdatedUser(connection, user.userData.id);
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
          if (requestedUserDB.length) {
            connection.sendUTF(JSON.stringify({
              type: 'privateMessage',
              requestId: id,
              data: {
                status: 'Try to login'
              }
            }));
          } else {
            const users = await this.usersDb.find({}).toArray()
            const user = new User(name, users.length, password, connection)
            this.usersDb.insertOne(user.userData).then(() => {
              this.usersDb.find().toArray().then(console.log)
            })
            user.onUpdate = (newData) => {
              console.log("on update", newData)
              this.usersDb.updateOne({userName: user.userData.userName}, {$set: {...newData}}).then(res => {
                this.usersDb.find().toArray().then(console.log)
              })
            }
            this.users.push(user);
            this.connections.set(connection, user);
            connection.sendUTF(JSON.stringify({
              type: 'privateMessage',
              requestId: id,
              data: {
                status: 'registered',
                id: user.userData.id,
                userName: user.userData.userName,
                chips: user.userData.chips,
                lastBonusTime: this.bonusTime - (Date.now() - user.userData.lastBonusTime),
                avatarUrl: user.userData.avatarUrl
              }
            }));
            this.sendUpdatedUser(connection, user.userData.id);
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
      if (data.data.name.includes(" ") || data.data.name.match(/[a-z][A-Z]/)) {
        return
      }
      authorizeUser(data.data.name, data.type, data.data.password);
    }
  }

  handleDisconnect(connection: connection) {
    this.connections.delete(connection);
    if (!this.withDatabase) {
      return
    }
    this.users.splice(this.users.findIndex(user => user.connection === connection), 1)
  }

  async sendUpdatedUser(connection: connection, id: number) {
    const data = await this.getUserData(id)
    connection.sendUTF(JSON.stringify({
      type: 'userUpdate',
      data,
    }))
  }

  async sendPrivateUpdatedUser(connection: connection, id: number, requestId: number) {
    const data = await this.getUserData(id)
    connection.sendUTF(JSON.stringify({
      type: 'privateMessage',
      requestId: requestId,
      data: data
    }))
  }

  async getUserData(id: number) {
    const [userData] = await this.usersDb.find({id}).toArray()
    if (!userData) {
      console.log("!!sfsfsd")
      return
    }
    return {
      id: userData.id,
      userName: userData.userName,
      chips: userData.chips,
      lastBonusTime: this.bonusTime - (Date.now() - userData.lastBonusTime),
      avatarUrl: userData.avatarUrl,
    }
  }

  getUserByConnection(connection: connection) {
    return this.connections.get(connection);
  }
}
