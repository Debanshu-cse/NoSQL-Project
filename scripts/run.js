require('dotenv').config();
const path = require('path');
const { connect, getClient, close } = require(path.join('..', 'src', 'db'));
const ops = require(path.join('..', 'src', 'operations'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'nosql_demo';

async function runOne(name, db, client) {
  if (!ops[name]) throw new Error('Unknown operation: ' + name);
  console.log('\n--- Running:', name);
  try {
    const res = await ops[name](db, client);
    console.log('Result for', name, ':', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error running', name, err && err.message ? err.message : err);
  }
}

async function runAll(db, client) {
  await ops.setupCollection(db);
  const order = [
    'createOne', 'createMany', 'findAll', 'findWithFilter', 'findOne',
    'updateOne', 'updateMany', 'upsertExample', 'replaceOne', 'deleteOne',
    'deleteMany', 'countDocs', 'distinctField', 'aggregateSample', 'bulkWriteExample',
    'projectionSortLimit', 'textSearch', 'transactionExample'
  ];
  for (const name of order) {
    try {
      await runOne(name, db, client);
    } catch (err) {
      console.error('Operation failed:', name, err && err.message ? err.message : err);
    }
  }
}

async function main() {
  const arg = process.argv[2] || 'all';
  let db;
  try {
    console.log('Connecting to MongoDB using URI:', MONGO_URI);
    db = await connect(MONGO_URI, DB_NAME);
  } catch (err) {
    console.error('\nFailed to connect to MongoDB.');
    console.error('Error:', err && err.message ? err.message : err);
    console.error('\nTroubleshooting tips:');
    console.error('- Make sure MongoDB is running locally (default host: localhost:27017).');
    console.error("  If you installed MongoDB as a Windows service named 'MongoDB', run: Start-Service MongoDB");
    console.error("  Or run the mongod binary, e.g.: & 'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe' --dbpath 'C:\\data\\db'");
    console.error('- Or use MongoDB Atlas: create a cluster and set MONGO_URI in a .env file (see .env.example).');
    console.error('- If you see IPv6 ::1 connection refused, try setting MONGO_URI to 127.0.0.1 explicitly in .env.');
    console.error('\nOnce you have MongoDB running, re-run the command: npm start');
    process.exit(1);
  }

  const client = getClient();
  try {
    if (arg === 'all') await runAll(db, client);
    else {
      await ops.setupCollection(db);
      if (!ops[arg]) {
        console.error('Unknown operation. Available:', Object.keys(ops).join(', '));
        process.exit(1);
      }
      await runOne(arg, db, client);
    }
  } finally {
    await close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
