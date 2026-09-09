const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed doctors if empty
    const Doctor = require('../models/Doctor');
    const { doctors } = require('../data/doctorsData');
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      logger.info('Seeding database with 150 doctor records...');
      await Doctor.insertMany(doctors);
      logger.info('Database seeded successfully with 150 doctors.');
    }
  } catch (error) {
    logger.warn(`MongoDB connection error: ${error.message}. Server running, waiting for DB connection...`);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting reconnect...');
});

module.exports = connectDB;
