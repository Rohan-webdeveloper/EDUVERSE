const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Disable command buffering on connection failure to prevent hanging requests
    mongoose.set('bufferCommands', false);
    console.error('   Server will continue but database features won\'t work.');
  }
};

module.exports = connectDB;
