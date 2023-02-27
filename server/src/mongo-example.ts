// import * as mongodb from 'mongodb';
//
// export const example = async () => {
//     const {MongoClient} = mongodb;
//     const client = new MongoClient('mongodb://127.0.0.1');
//
//     const q = client.db("mongo").collection("users")
//     
//     await q.deleteMany({})
//     await q.insertMany(new Array(8).fill(null).map((_, i) => ({name: `jack grelish ${i}`, avatarUrl: "http://localhost:4002/avatar/123"})))
//     await q.insertOne({name: "null"}) 
//     const deleted = await q.deleteMany({name: {$regex: /(null)/}})
//     console.log(deleted)
//     await q.insertOne({q: Math.random()})
//     const neededJack = q.find({name: "jack grelish 7"})
//     q.updateOne({name: "jack grelish 7"}, {$set: {avatarUrl: ""}})
//     q.find().toArray().then(res => console.log(res));
// }
//
// type q = mongodb.Filter<mongodb.Document>
