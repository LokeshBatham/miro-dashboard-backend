const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  const connect = async () => {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      console.log('⏳ Retrying connection in 5 seconds...');
      console.log('💡 If using local MongoDB, make sure mongod is running.');
      console.log('💡 Or update MONGODB_URI in .env to a MongoDB Atlas connection string.');
      setTimeout(connect, 5000);
    }
  };

  await connect();
};

module.exports = connectDB;

