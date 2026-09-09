require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('../src/models/Doctor');
const Patient = require('../src/models/Patient');
const Appointment = require('../src/models/Appointment');

const MONGODB_URI = process.env.MONGODB_URI;

// ─── Seed Data ───────────────────────────────────────────────────────────────

const { doctors } = require('../src/data/doctorsData');

const rawPatients = [
  {
    name: 'Karthik Selvam',
    email: 'karthik.selvam@email.com',
    password: 'Password123',
    phone: '+919876543210',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'male',
    bloodGroup: 'O+',
    address: { street: '12 Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040' },
  },
  {
    name: 'Divya Ramesh',
    email: 'divya.ramesh@email.com',
    password: 'Password123',
    phone: '+919876543211',
    dateOfBirth: new Date('1995-08-22'),
    gender: 'female',
    bloodGroup: 'A+',
    address: { street: '45 T. Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017' },
  },
  {
    name: 'Mohan Raj',
    email: 'mohan.raj@email.com',
    password: 'Password123',
    phone: '+919876543212',
    dateOfBirth: new Date('1985-11-30'),
    gender: 'male',
    bloodGroup: 'B+',
    address: { street: '78 Velachery Main Road', city: 'Chennai', state: 'Tamil Nadu', pincode: '600042' },
  },
  {
    name: 'Seetha Devi',
    email: 'seetha.devi@email.com',
    password: 'Password123',
    phone: '+919876543213',
    dateOfBirth: new Date('1978-03-10'),
    gender: 'female',
    bloodGroup: 'AB+',
    address: { street: '23 Adyar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600020' },
  },
  {
    name: 'Arun Kumar',
    email: 'arun.kumar@email.com',
    password: 'Password123',
    phone: '+919876543214',
    dateOfBirth: new Date('2000-07-18'),
    gender: 'male',
    bloodGroup: 'O-',
    address: { street: '56 Porur', city: 'Chennai', state: 'Tamil Nadu', pincode: '600116' },
  },
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // ── Clear existing data ──────────────────────────────────────────────────
    console.log('🗑️  Clearing existing data...');
    await Appointment.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    console.log('✅ Cleared existing collections\n');

    // ── Insert Doctors ───────────────────────────────────────────────────────
    console.log('👨‍⚕️  Inserting doctors...');
    const insertedDoctors = await Doctor.insertMany(doctors);
    console.log(`✅ Inserted ${insertedDoctors.length} doctors\n`);

    // ── Insert Patients (with hashed passwords) ──────────────────────────────
    console.log('🧑‍🤝‍🧑 Inserting patients...');
    const insertedPatients = [];
    for (const p of rawPatients) {
      const hashed = await bcrypt.hash(p.password, 12);
      const patient = await Patient.create({ ...p, password: hashed });
      insertedPatients.push(patient);
      console.log(`   ✔ ${patient.name} (${patient.email})`);
    }
    console.log(`\n✅ Inserted ${insertedPatients.length} patients\n`);

    // ── Insert Appointments ──────────────────────────────────────────────────
    console.log('📅 Inserting appointments...');
    const today = new Date();
    const appointments = [
      {
        patient: insertedPatients[0]._id,
        doctor: insertedDoctors[0]._id, // Cardiology
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
        timeSlot: '09:00',
        status: 'confirmed',
        reason: 'Chest pain and shortness of breath during exercise',
        consultationFee: insertedDoctors[0].consultationFee,
        paymentStatus: 'paid',
      },
      {
        patient: insertedPatients[1]._id,
        doctor: insertedDoctors[1]._id, // Pediatrics
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        timeSlot: '10:00',
        status: 'confirmed',
        reason: 'Child fever and cold for 3 days',
        consultationFee: insertedDoctors[1].consultationFee,
        paymentStatus: 'paid',
      },
      {
        patient: insertedPatients[2]._id,
        doctor: insertedDoctors[2]._id, // Orthopedics
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
        timeSlot: '14:00',
        status: 'confirmed',
        reason: 'Knee pain and difficulty walking',
        consultationFee: insertedDoctors[2].consultationFee,
        paymentStatus: 'pending',
      },
      {
        patient: insertedPatients[3]._id,
        doctor: insertedDoctors[3]._id, // Dermatology
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
        timeSlot: '10:30',
        status: 'confirmed',
        reason: 'Skin rash and itching on arms',
        consultationFee: insertedDoctors[3].consultationFee,
        paymentStatus: 'paid',
      },
      {
        patient: insertedPatients[4]._id,
        doctor: insertedDoctors[4]._id, // Neurology
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
        timeSlot: '09:30',
        status: 'confirmed',
        reason: 'Frequent migraines and dizziness',
        consultationFee: insertedDoctors[4].consultationFee,
        paymentStatus: 'pending',
      },
      {
        patient: insertedPatients[0]._id,
        doctor: insertedDoctors[6]._id, // General Practice
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
        timeSlot: '11:00',
        status: 'completed',
        reason: 'Annual health checkup',
        notes: 'All vitals normal. Advised to exercise regularly and maintain a balanced diet.',
        consultationFee: insertedDoctors[6].consultationFee,
        paymentStatus: 'paid',
      },
      {
        patient: insertedPatients[1]._id,
        doctor: insertedDoctors[5]._id, // Gynecology
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
        timeSlot: '09:30',
        status: 'completed',
        reason: 'Routine gynecology checkup',
        notes: 'All reports normal. Follow-up in 6 months.',
        consultationFee: insertedDoctors[5].consultationFee,
        paymentStatus: 'paid',
      },
      {
        patient: insertedPatients[2]._id,
        doctor: insertedDoctors[7]._id, // Psychiatry
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10),
        timeSlot: '14:00',
        status: 'cancelled',
        reason: 'Anxiety and sleep issues',
        consultationFee: insertedDoctors[7].consultationFee,
        paymentStatus: 'refunded',
      },
    ];

    const insertedAppointments = await Appointment.insertMany(appointments);
    console.log(`✅ Inserted ${insertedAppointments.length} appointments\n`);

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════');
    console.log('🏥  SEED COMPLETE — Hospital Database Summary');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  👨‍⚕️  Doctors      : ${insertedDoctors.length}`);
    console.log(`  🧑  Patients     : ${insertedPatients.length}`);
    console.log(`  📅  Appointments : ${insertedAppointments.length}`);
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📋 Patient Login Credentials (all passwords: Password123)');
    for (const p of insertedPatients) {
      console.log(`   📧 ${p.email}`);
    }
    console.log('\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
