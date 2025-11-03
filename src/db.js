const { MongoClient } = require('mongodb');

let client;
let db;

async function connect(uri, dbName) {
  if (db) return db;
  client = new MongoClient(uri, {
    // useUnifiedTopology is default in modern drivers
  });
  await client.connect();
  db = client.db(dbName);
  return db;
}

function getClient() {
  return client;
}

async function close() {
  if (client) await client.close();
  client = null;
  db = null;
}

module.exports = { connect, getClient, close };
