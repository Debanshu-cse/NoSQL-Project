require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connect, getClient, close } = require('../src/db');
const ops = require('../src/operations');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'nosql_demo';

let db;
let client;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB on startup
async function initDb() {
  try {
    db = await connect(MONGO_URI, DB_NAME);
    client = getClient();
    await ops.setupCollection(db);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

// API Routes
app.get('/api/operations', (req, res) => {
  const operationList = Object.keys(ops).filter(key => typeof ops[key] === 'function' && key !== 'setupCollection');
  res.json({ operations: operationList });
});

app.post('/api/run/:operation', async (req, res) => {
  const { operation } = req.params;
  
  if (!ops[operation]) {
    return res.status(404).json({ error: 'Operation not found' });
  }

  try {
    const result = await ops[operation](db, client);
    res.json({ 
      success: true, 
      operation, 
      result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      operation, 
      error: err.message 
    });
  }
});

app.post('/api/run-all', async (req, res) => {
  const results = [];
  const operationList = [
    'createOne', 'createMany', 'findAll', 'findWithFilter', 'findOne',
    'updateOne', 'updateMany', 'upsertExample', 'replaceOne', 'deleteOne',
    'deleteMany', 'countDocs', 'distinctField', 'aggregateSample', 
    'bulkWriteExample', 'projectionSortLimit', 'textSearch', 'transactionExample'
  ];

  try {
    await ops.setupCollection(db);
    
    for (const operation of operationList) {
      try {
        const result = await ops[operation](db, client);
        results.push({ 
          success: true, 
          operation, 
          result 
        });
      } catch (err) {
        results.push({ 
          success: false, 
          operation, 
          error: err.message 
        });
      }
    }
    
    res.json({ 
      success: true, 
      totalOperations: results.length,
      results 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const collection = db.collection('students');
    const count = await collection.countDocuments({});
    const majors = await collection.distinct('major');
    
    res.json({
      totalDocuments: count,
      uniqueMajors: majors,
      database: DB_NAME,
      collection: 'students'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dynamic CRUD endpoints for user input
app.get('/api/students', async (req, res) => {
  try {
    const collection = db.collection('students');
    const students = await collection.find({}).sort({ _id: -1 }).toArray();
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { name, age, major, gpa, bio } = req.body;
    
    if (!name || !age || !major) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, age, and major are required fields' 
      });
    }

    const collection = db.collection('students');
    const student = { name, age: parseInt(age), major };
    if (gpa) student.gpa = parseFloat(gpa);
    if (bio) student.bio = bio;

    const result = await collection.insertOne(student);
    res.json({ 
      success: true, 
      message: 'Student added successfully',
      insertedId: result.insertedId,
      student
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, major, gpa, bio } = req.body;
    
    const collection = db.collection('students');
    const updateDoc = {};
    if (name) updateDoc.name = name;
    if (age) updateDoc.age = parseInt(age);
    if (major) updateDoc.major = major;
    if (gpa !== undefined) updateDoc.gpa = parseFloat(gpa);
    if (bio !== undefined) updateDoc.bio = bio;

    const { ObjectId } = require('mongodb');
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    res.json({ 
      success: true, 
      message: 'Student updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = require('mongodb');
    const collection = db.collection('students');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    res.json({ 
      success: true, 
      message: 'Student deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/students/search', async (req, res) => {
  try {
    const { query } = req.body;
    const collection = db.collection('students');
    
    let filter = {};
    if (query.major) filter.major = query.major;
    if (query.minGpa) filter.gpa = { $gte: parseFloat(query.minGpa) };
    if (query.maxAge) filter.age = { $lte: parseInt(query.maxAge) };
    
    const students = await collection.find(filter).toArray();
    res.json({ success: true, students, count: students.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/students', async (req, res) => {
  try {
    const collection = db.collection('students');
    const result = await collection.deleteMany({});
    res.json({ 
      success: true, 
      message: 'All students cleared',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 Database: ${DB_NAME}`);
    console.log(`🔗 MongoDB URI: ${MONGO_URI.substring(0, 30)}...`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔒 Closing MongoDB connection...');
  await close();
  process.exit(0);
});
