const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusai';

async function resetDatabase() {
  try {
    console.log('Connecting to MongoDB for reset...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const collections = await mongoose.connection.db.collections();
    
    for (let collection of collections) {
      console.log(`Clearing collection: ${collection.collectionName}`);
      await collection.deleteMany({});
    }

    console.log('Database reset complete. All collections are now empty.');
    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();
