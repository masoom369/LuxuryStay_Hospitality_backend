const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_management');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    console.error('Full Error:', error);
    process.exit(1);
  }
};

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('connected to MongoDB successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

module.exports = { connectDatabase };
