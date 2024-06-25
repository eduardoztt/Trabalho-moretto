// db.js
const { MongoClient, ObjectId } = require("mongodb");

let dbConnection;

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect('mongodb://localhost:27017/SITEDW')
      .then((client) => {
        dbConnection = client.db();
        return cb();
      })
      .catch(err => {
        console.log(err);
      });
  },
  getDb: () => dbConnection
};