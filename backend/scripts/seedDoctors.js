require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../src/models/Doctor');

const { doctors } = require('../src/data/doctorsData');

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    await Doctor.deleteMany({});
    console.log('🗑️  Cleared existing doctors');

    const inserted = await Doctor.insertMany(doctors);
    console.log(`✅ Seeded ${inserted.length} doctors successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDoctors();
