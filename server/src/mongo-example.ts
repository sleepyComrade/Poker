import * as mongodb from 'mongodb';

export const example = () => {
    const {MongoClient} = mongodb;
    const client = new MongoClient('mongodb://localhost:27017');
    
    client.db('mongo').collection('users').find().toArray().then(res => console.log(res));
}
