const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const connectDB = async () => {
  try {
    // Connect to MongoDB using URI from environment variables
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    // Log connection errors and exit the app
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
