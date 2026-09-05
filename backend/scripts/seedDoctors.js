require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../src/models/Doctor');

const doctors = [
  {
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    qualification: 'MD, DM (Cardiology) - Harvard Medical School',
    experience: 15,
    rating: 4.9,
    reviewCount: 342,
    consultationFee: 1500,
    hospital: 'City Heart Hospital',
    bio: 'Specialist in interventional cardiology with 15 years of experience treating complex heart conditions.',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=0ea5e9&color=fff&size=200',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  {
    name: 'Dr. Rajesh Kumar',
    specialty: 'Orthopedics',
    qualification: 'MS (Ortho), FRCS - AIIMS Delhi',
    experience: 12,
    rating: 4.8,
    reviewCount: 287,
    consultationFee: 1200,
    hospital: 'Apollo Specialty Hospital',
    bio: 'Expert in joint replacement surgeries and sports injuries with over 2000 successful surgeries.',
    avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=10b981&color=fff&size=200',
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
  },
  {
    name: 'Dr. Priya Sharma',
    specialty: 'Pediatrics',
    qualification: 'MD (Pediatrics) - CMC Vellore',
    experience: 10,
    rating: 4.9,
    reviewCount: 523,
    consultationFee: 800,
    hospital: 'Children\'s Health Center',
    bio: 'Dedicated pediatrician with a gentle approach to child healthcare. Specializes in developmental pediatrics.',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=8b5cf6&color=fff&size=200',
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'],
  },
  {
    name: 'Dr. Michael Chen',
    specialty: 'Neurology',
    qualification: 'MD, DM (Neurology) - Johns Hopkins University',
    experience: 18,
    rating: 4.7,
    reviewCount: 198,
    consultationFee: 2000,
    hospital: 'NeuroScience Medical Center',
    bio: 'Leading neurologist specializing in epilepsy, stroke, and movement disorders.',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=f59e0b&color=fff&size=200',
    availableDays: ['Tuesday', 'Wednesday', 'Thursday'],
  },
  {
    name: 'Dr. Ananya Patel',
    specialty: 'Dermatology',
    qualification: 'MD (Dermatology) - PGIMER Chandigarh',
    experience: 8,
    rating: 4.8,
    reviewCount: 412,
    consultationFee: 1000,
    hospital: 'Skin & Hair Clinic',
    bio: 'Expert in medical and cosmetic dermatology. Specializes in acne, psoriasis, and skin cancer detection.',
    avatar: 'https://ui-avatars.com/api/?name=Ananya+Patel&background=ec4899&color=fff&size=200',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
  },
  {
    name: 'Dr. David Wilson',
    specialty: 'Gastroenterology',
    qualification: 'MD, DM (Gastro) - Mayo Clinic',
    experience: 20,
    rating: 4.6,
    reviewCount: 156,
    consultationFee: 1800,
    hospital: 'Digestive Health Institute',
    bio: 'Renowned gastroenterologist with expertise in inflammatory bowel disease and GI endoscopy.',
    avatar: 'https://ui-avatars.com/api/?name=David+Wilson&background=06b6d4&color=fff&size=200',
    availableDays: ['Monday', 'Thursday', 'Friday'],
  },
  {
    name: 'Dr. Sneha Reddy',
    specialty: 'Gynecology',
    qualification: 'MS (OB-GYN) - NIMHANS Bangalore',
    experience: 13,
    rating: 4.9,
    reviewCount: 634,
    consultationFee: 1100,
    hospital: 'Women\'s Wellness Hospital',
    bio: 'Compassionate gynecologist specializing in high-risk pregnancies and minimally invasive gynecological surgeries.',
    avatar: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=ef4444&color=fff&size=200',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
  {
    name: 'Dr. Ahmed Hassan',
    specialty: 'Psychiatry',
    qualification: 'MD (Psychiatry), MRCPsych - London',
    experience: 11,
    rating: 4.7,
    reviewCount: 89,
    consultationFee: 1500,
    hospital: 'Mind & Mental Health Center',
    bio: 'Compassionate psychiatrist with expertise in mood disorders, anxiety, and addiction medicine.',
    avatar: 'https://ui-avatars.com/api/?name=Ahmed+Hassan&background=7c3aed&color=fff&size=200',
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
];

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
