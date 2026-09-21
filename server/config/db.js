const mongoose = require('mongoose');
const config = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri, {
    autoIndex: config.nodeEnv !== 'production',
    serverSelectionTimeoutMS: 10000,
  });
  return mongoose.connection;
}

module.exports = connectDB;
