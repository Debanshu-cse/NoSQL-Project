// Collection: students
// Each function receives a connected `db` instance.

async function setupCollection(db) {
  const col = db.collection('students');
  // ensure a text index for text search demo
  await col.createIndex({ name: 'text', bio: 'text' });
  return col;
}

async function createOne(db) {
  const col = db.collection('students');
  const doc = { name: 'Alice', age: 23, major: 'CS', gpa: 3.7, bio: 'Loves databases' };
  const r = await col.insertOne(doc);
  return r;
}

async function createMany(db) {
  const col = db.collection('students');
  const docs = [
    { name: 'Bob', age: 24, major: 'EE', gpa: 3.4 },
    { name: 'Carol', age: 22, major: 'Math', gpa: 3.9 },
    { name: 'Dave', age: 25, major: 'CS', gpa: 3.2 }
  ];
  return col.insertMany(docs);
}

async function findAll(db) {
  const col = db.collection('students');
  return col.find().toArray();
}

async function findWithFilter(db) {
  const col = db.collection('students');
  return col.find({ major: 'CS' }).toArray();
}

async function findOne(db) {
  const col = db.collection('students');
  return col.findOne({ name: 'Alice' });
}

async function updateOne(db) {
  const col = db.collection('students');
  return col.updateOne({ name: 'Alice' }, { $set: { gpa: 3.8 } });
}

async function updateMany(db) {
  const col = db.collection('students');
  return col.updateMany({ major: 'CS' }, { $inc: { gpa: 0.01 } });
}

async function upsertExample(db) {
  const col = db.collection('students');
  return col.updateOne({ name: 'Eve' }, { $set: { age: 21, major: 'Bio' } }, { upsert: true });
}

async function replaceOne(db) {
  const col = db.collection('students');
  return col.replaceOne({ name: 'Bob' }, { name: 'Robert', age: 24, major: 'EE', note: 'Replaced doc' });
}

async function deleteOne(db) {
  const col = db.collection('students');
  return col.deleteOne({ name: 'Dave' });
}

async function deleteMany(db) {
  const col = db.collection('students');
  return col.deleteMany({ major: 'Math' });
}

async function countDocs(db) {
  const col = db.collection('students');
  return col.countDocuments();
}

async function distinctField(db) {
  const col = db.collection('students');
  return col.distinct('major');
}

async function aggregateSample(db) {
  const col = db.collection('students');
  return col.aggregate([
    { $match: { gpa: { $gte: 3.0 } } },
    { $group: { _id: '$major', avgGPA: { $avg: '$gpa' }, count: { $sum: 1 } } },
    { $sort: { avgGPA: -1 } }
  ]).toArray();
}

async function bulkWriteExample(db) {
  const col = db.collection('students');
  const ops = [
    { insertOne: { document: { name: 'Frank', age: 20, major: 'CS' } } },
    { updateOne: { filter: { name: 'Carol' }, update: { $set: { gpa: 4.0 } } } },
    { deleteOne: { filter: { name: 'Robert' } } }
  ];
  return col.bulkWrite(ops);
}

async function projectionSortLimit(db) {
  const col = db.collection('students');
  return col.find({}, { projection: { name: 1, major: 1, _id: 0 } }).sort({ name: 1 }).limit(5).toArray();
}

async function textSearch(db) {
  const col = db.collection('students');
  return col.find({ $text: { $search: 'databases OR loves' } }).toArray();
}

// Note: transactions require a replica set (even a single-node RS).
async function transactionExample(db, client) {
  const session = client.startSession();
  let result = { ok: false };
  try {
    await session.withTransaction(async () => {
      const col = db.collection('students');
      await col.insertOne({ name: 'TxnUser', age: 30 }, { session });
      await col.updateOne({ name: 'Alice' }, { $inc: { age: 1 } }, { session });
    });
    result.ok = true;
  } catch (err) {
    result.error = err.message;
  } finally {
    await session.endSession();
  }
  return result;
}

module.exports = {
  setupCollection,
  createOne,
  createMany,
  findAll,
  findWithFilter,
  findOne,
  updateOne,
  updateMany,
  upsertExample,
  replaceOne,
  deleteOne,
  deleteMany,
  countDocs,
  distinctField,
  aggregateSample,
  bulkWriteExample,
  projectionSortLimit,
  textSearch,
  transactionExample
};
