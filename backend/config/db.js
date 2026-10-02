const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryMongoServer;

async function connectDB() {
  let mongoUri = process.env.MONGODB_URI;

  try {
    if (!mongoUri) {
      memoryMongoServer = await MongoMemoryServer.create();
      mongoUri = memoryMongoServer.getUri('pet-store');
      console.log('No MONGODB_URI configured. Started an in-memory MongoDB for development.');
    }

    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB (${process.env.MONGODB_URI ? 'configured instance' : 'development instance'}).`);
  } catch (error) {
    if (memoryMongoServer) {
      await memoryMongoServer.stop();
      memoryMongoServer = null;
    }
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

module.exports = connectDB;
