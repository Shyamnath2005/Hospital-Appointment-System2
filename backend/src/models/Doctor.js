const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      enum: [
        'Cardiology',
        'Dermatology',
        'Endocrinology',
        'Gastroenterology',
        'General Practice',
        'Gynecology',
        'Neurology',
        'Oncology',
        'Ophthalmology',
        'Orthopedics',
        'Pediatrics',
        'Psychiatry',
        'Pulmonology',
        'Radiology',
        'Urology',
      ],
    },
    qualification: {
      type: String,
      required: true,
    },
    experience: {
      type: Number, // years
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    availableDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    availableSlots: {
      type: [String],
      default: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'],
    },
    hospital: {
      type: String,
      required: true,
    },
    hospitalLocation: {
      type: String,
      default: 'Chennai',
    },
    hospitalAddress: {
      type: String,
      default: '',
    },
    languages: {
      type: [String],
      default: ['English', 'Hindi'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    contactNumber: {
      type: String,
      default: '+91 44 2829 0200',
    },
    bio: {
      type: String,
      maxlength: 1000,
    },
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?name=Doctor&background=0ea5e9&color=fff',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

doctorSchema.index({ specialty: 1, hospital: 1, hospitalLocation: 1, name: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);
