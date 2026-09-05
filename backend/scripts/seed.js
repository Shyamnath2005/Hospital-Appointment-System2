require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('../src/models/Doctor');
const Patient = require('../src/models/Patient');
const Appointment = require('../src/models/Appointment');

const MONGODB_URI = process.env.MONGODB_URI;

// ─── Seed Data ───────────────────────────────────────────────────────────────

const doctors = [
  // ── Cardiology ────────────────────────────────────────────────────────────
  {
    name: 'Dr. Arjun Sharma',
    specialty: 'Cardiology',
    qualification: 'MBBS, MD (Cardiology), FACC',
    experience: 18,
    rating: 4.9,
    reviewCount: 320,
    consultationFee: 800,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'],
    hospital: 'Apollo Hospital, Chennai',
    bio: 'Senior cardiologist with 18+ years of experience in interventional cardiology and heart failure management.',
    avatar: 'https://ui-avatars.com/api/?name=Arjun+Sharma&background=ef4444&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Ramesh Iyer',
    specialty: 'Cardiology',
    qualification: 'MBBS, DM (Cardiology), FESC',
    experience: 22,
    rating: 4.9,
    reviewCount: 510,
    consultationFee: 1200,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableSlots: ['10:00', '10:30', '11:00', '14:00', '14:30'],
    hospital: 'Fortis Malar Hospital, Chennai',
    bio: 'Pioneer in cardiac electrophysiology with over two decades of expertise in complex arrhythmia management.',
    avatar: 'https://ui-avatars.com/api/?name=Ramesh+Iyer&background=dc2626&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Kavitha Mohan',
    specialty: 'Cardiology',
    qualification: 'MBBS, MD, DM (Cardiology)',
    experience: 13,
    rating: 4.7,
    reviewCount: 214,
    consultationFee: 900,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableSlots: ['09:00', '09:30', '10:00', '11:00', '15:00', '15:30'],
    hospital: 'Kauvery Hospital, Chennai',
    bio: 'Non-invasive cardiologist specializing in echocardiography and preventive cardiology for women.',
    avatar: 'https://ui-avatars.com/api/?name=Kavitha+Mohan&background=b91c1c&color=fff',
    isAvailable: true,
  },

  // ── Dermatology ───────────────────────────────────────────────────────────
  {
    name: 'Dr. Meera Venkatesh',
    specialty: 'Dermatology',
    qualification: 'MBBS, MD (Dermatology), DVD',
    experience: 10,
    rating: 4.8,
    reviewCount: 180,
    consultationFee: 700,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'],
    hospital: 'Skin & Hair Clinic, Chennai',
    bio: 'Dermatologist specializing in cosmetic dermatology, acne treatment, and skin cancer detection.',
    avatar: 'https://ui-avatars.com/api/?name=Meera+Venkatesh&background=f59e0b&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Deepak Nambiar',
    specialty: 'Dermatology',
    qualification: 'MBBS, MD (DVL), FRCP (Dermatology)',
    experience: 16,
    rating: 4.7,
    reviewCount: 260,
    consultationFee: 800,
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    hospital: 'Manipal Hospital, Chennai',
    bio: 'Expert in laser dermatology, hair restoration, and treatment of chronic skin conditions like psoriasis and eczema.',
    avatar: 'https://ui-avatars.com/api/?name=Deepak+Nambiar&background=d97706&color=fff',
    isAvailable: true,
  },

  // ── Endocrinology ─────────────────────────────────────────────────────────
  {
    name: 'Dr. Sunita Rao',
    specialty: 'Endocrinology',
    qualification: 'MBBS, MD (Medicine), DM (Endocrinology)',
    experience: 14,
    rating: 4.8,
    reviewCount: 197,
    consultationFee: 900,
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00', '09:30', '10:00', '14:00', '14:30', '15:00'],
    hospital: 'Sri Ramachandra Hospital, Chennai',
    bio: 'Endocrinologist specializing in diabetes management, thyroid disorders, and hormonal imbalances.',
    avatar: 'https://ui-avatars.com/api/?name=Sunita+Rao&background=84cc16&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Harish Menon',
    specialty: 'Endocrinology',
    qualification: 'MBBS, MD, DM (Endocrinology), FACE',
    experience: 19,
    rating: 4.9,
    reviewCount: 380,
    consultationFee: 1100,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableSlots: ['10:00', '10:30', '11:00', '14:30', '15:00'],
    hospital: 'Apollo Hospital, Chennai',
    bio: 'Renowned endocrinologist with expertise in advanced diabetes care, obesity management, and pituitary disorders.',
    avatar: 'https://ui-avatars.com/api/?name=Harish+Menon&background=65a30d&color=fff',
    isAvailable: true,
  },

  // ── Gastroenterology ──────────────────────────────────────────────────────
  {
    name: 'Dr. Balaji Subramanian',
    specialty: 'Gastroenterology',
    qualification: 'MBBS, MD (Medicine), DM (Gastroenterology)',
    experience: 17,
    rating: 4.8,
    reviewCount: 302,
    consultationFee: 950,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00', '09:30', '10:00', '11:00', '14:00', '15:00'],
    hospital: 'Global Hospitals, Chennai',
    bio: 'Expert gastroenterologist specializing in endoscopy, liver diseases, and inflammatory bowel disease.',
    avatar: 'https://ui-avatars.com/api/?name=Balaji+Subramanian&background=f97316&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Nithya Chandran',
    specialty: 'Gastroenterology',
    qualification: 'MBBS, MD, DM (Gastroenterology)',
    experience: 11,
    rating: 4.6,
    reviewCount: 155,
    consultationFee: 800,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    hospital: 'Vijaya Hospital, Chennai',
    bio: 'Gastroenterologist with expertise in advanced therapeutic endoscopy and management of GI cancers.',
    avatar: 'https://ui-avatars.com/api/?name=Nithya+Chandran&background=ea580c&color=fff',
    isAvailable: true,
  },

  // ── General Practice ──────────────────────────────────────────────────────
  {
    name: 'Dr. Vikram Patel',
    specialty: 'General Practice',
    qualification: 'MBBS, MRCGP',
    experience: 8,
    rating: 4.6,
    reviewCount: 160,
    consultationFee: 400,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'],
    hospital: 'City Health Centre, Chennai',
    bio: 'Family physician providing primary healthcare, preventive medicine, and chronic disease management.',
    avatar: 'https://ui-avatars.com/api/?name=Vikram+Patel&background=6366f1&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Radha Gopalan',
    specialty: 'General Practice',
    qualification: 'MBBS, PGDM (Family Medicine)',
    experience: 5,
    rating: 4.5,
    reviewCount: 98,
    consultationFee: 300,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '16:00', '16:30', '17:00'],
    hospital: 'Neighborhood Clinic, Adyar, Chennai',
    bio: 'Friendly GP focused on community health, maternal care, and managing everyday ailments efficiently.',
    avatar: 'https://ui-avatars.com/api/?name=Radha+Gopalan&background=4f46e5&color=fff',
    isAvailable: true,
  },

  // ── Gynecology ────────────────────────────────────────────────────────────
  {
    name: 'Dr. Lakshmi Sundaram',
    specialty: 'Gynecology',
    qualification: 'MBBS, MD (OBG), FRCOG',
    experience: 14,
    rating: 4.7,
    reviewCount: 290,
    consultationFee: 700,
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '15:00'],
    hospital: 'Vijaya Hospital, Chennai',
    bio: 'Experienced gynecologist and obstetrician providing comprehensive women\'s healthcare services.',
    avatar: 'https://ui-avatars.com/api/?name=Lakshmi+Sundaram&background=ec4899&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Suganya Pillai',
    specialty: 'Gynecology',
    qualification: 'MBBS, MS (OBG), Fellowship in Reproductive Medicine',
    experience: 16,
    rating: 4.9,
    reviewCount: 445,
    consultationFee: 1000,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableSlots: ['09:00', '09:30', '10:00', '11:00', '14:00', '14:30'],
    hospital: 'SRMC Hospital, Chennai',
    bio: 'Renowned gynecologist specializing in high-risk pregnancies, infertility treatments, and minimal-invasive surgeries.',
    avatar: 'https://ui-avatars.com/api/?name=Suganya+Pillai&background=db2777&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Parvathy Krishnaswamy',
    specialty: 'Gynecology',
    qualification: 'MBBS, MD (OBG), DNB',
    experience: 9,
    rating: 4.6,
    reviewCount: 173,
    consultationFee: 650,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableSlots: ['09:30', '10:00', '10:30', '11:00', '14:30', '15:00'],
    hospital: 'Kauvery Hospital, Chennai',
    bio: 'Gynecologist with a focus on adolescent health, PCOS management, and laparoscopic procedures.',
    avatar: 'https://ui-avatars.com/api/?name=Parvathy+Krishnaswamy&background=be185d&color=fff',
    isAvailable: true,
  },

  // ── Neurology ─────────────────────────────────────────────────────────────
  {
    name: 'Dr. Suresh Babu',
    specialty: 'Neurology',
    qualification: 'MBBS, DM (Neurology), FRCP',
    experience: 20,
    rating: 4.9,
    reviewCount: 410,
    consultationFee: 1000,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableSlots: ['09:00', '09:30', '10:00', '11:00', '14:00', '14:30'],
    hospital: 'Sri Ramachandra Hospital, Chennai',
    bio: 'Leading neurologist with expertise in epilepsy, stroke management, and neurodegenerative disorders.',
    avatar: 'https://ui-avatars.com/api/?name=Suresh+Babu&background=10b981&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Aishwarya Rajan',
    specialty: 'Neurology',
    qualification: 'MBBS, MD (Medicine), DM (Neurology)',
    experience: 12,
    rating: 4.7,
    reviewCount: 229,
    consultationFee: 900,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    hospital: 'Apollo Hospital, Chennai',
    bio: 'Neurologist specializing in headache disorders, movement disorders, and multiple sclerosis.',
    avatar: 'https://ui-avatars.com/api/?name=Aishwarya+Rajan&background=059669&color=fff',
    isAvailable: true,
  },

  // ── Oncology ──────────────────────────────────────────────────────────────
  {
    name: 'Dr. Senthil Nathan',
    specialty: 'Oncology',
    qualification: 'MBBS, MD (Medicine), DM (Medical Oncology)',
    experience: 21,
    rating: 4.9,
    reviewCount: 520,
    consultationFee: 1500,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30'],
    hospital: 'Cancer Institute (WIA), Chennai',
    bio: 'Oncologist with extensive experience in medical oncology including chemotherapy, immunotherapy, and targeted therapy.',
    avatar: 'https://ui-avatars.com/api/?name=Senthil+Nathan&background=7c3aed&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Geetha Padmanabhan',
    specialty: 'Oncology',
    qualification: 'MBBS, MS (General Surgery), MCh (Surgical Oncology)',
    experience: 18,
    rating: 4.8,
    reviewCount: 355,
    consultationFee: 1200,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableSlots: ['10:00', '11:00', '14:00', '15:00'],
    hospital: 'Adyar Cancer Institute, Chennai',
    bio: 'Surgical oncologist specialized in breast, colorectal, and thyroid cancer surgeries with minimally invasive techniques.',
    avatar: 'https://ui-avatars.com/api/?name=Geetha+Padmanabhan&background=6d28d9&color=fff',
    isAvailable: true,
  },

  // ── Ophthalmology ─────────────────────────────────────────────────────────
  {
    name: 'Dr. Vishal Anand',
    specialty: 'Ophthalmology',
    qualification: 'MBBS, MS (Ophthalmology), FICO',
    experience: 13,
    rating: 4.8,
    reviewCount: 278,
    consultationFee: 700,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'],
    hospital: 'Sankara Nethralaya, Chennai',
    bio: 'Ophthalmologist specializing in cataract surgery, LASIK, retinal disorders, and glaucoma management.',
    avatar: 'https://ui-avatars.com/api/?name=Vishal+Anand&background=0284c7&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Revathi Muthukumar',
    specialty: 'Ophthalmology',
    qualification: 'MBBS, DO (Ophthalmology), DNB',
    experience: 9,
    rating: 4.6,
    reviewCount: 149,
    consultationFee: 600,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    hospital: 'Aravind Eye Hospital, Chennai',
    bio: 'Eye specialist with expertise in pediatric ophthalmology, squint correction, and contact lens evaluation.',
    avatar: 'https://ui-avatars.com/api/?name=Revathi+Muthukumar&background=0369a1&color=fff',
    isAvailable: true,
  },

  // ── Orthopedics ───────────────────────────────────────────────────────────
  {
    name: 'Dr. Ravi Kumar',
    specialty: 'Orthopedics',
    qualification: 'MBBS, MS (Orthopedics), DNB',
    experience: 15,
    rating: 4.7,
    reviewCount: 198,
    consultationFee: 750,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    hospital: 'MIOT International, Chennai',
    bio: 'Expert orthopedic surgeon specializing in joint replacement, sports injuries, and spinal disorders.',
    avatar: 'https://ui-avatars.com/api/?name=Ravi+Kumar&background=0ea5e9&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Praveen Selvaraj',
    specialty: 'Orthopedics',
    qualification: 'MBBS, MS (Ortho), Fellowship in Sports Medicine',
    experience: 10,
    rating: 4.7,
    reviewCount: 176,
    consultationFee: 700,
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    availableSlots: ['09:30', '10:00', '10:30', '11:00', '14:30', '15:00'],
    hospital: 'Cloudnine Hospital, Chennai',
    bio: 'Sports medicine orthopedician with expertise in arthroscopic knee surgery, shoulder injuries, and fracture management.',
    avatar: 'https://ui-avatars.com/api/?name=Praveen+Selvaraj&background=0891b2&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Jayashree Varma',
    specialty: 'Orthopedics',
    qualification: 'MBBS, MS (Orthopedics), MCh (Spine Surgery)',
    experience: 20,
    rating: 4.9,
    reviewCount: 398,
    consultationFee: 1100,
    availableDays: ['Monday', 'Tuesday', 'Thursday'],
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    hospital: 'Apollo Spectra, Chennai',
    bio: 'Spine surgeon with two decades of experience in complex spinal deformity corrections, disc replacements, and scoliosis treatment.',
    avatar: 'https://ui-avatars.com/api/?name=Jayashree+Varma&background=06b6d4&color=fff',
    isAvailable: true,
  },

  // ── Pediatrics ────────────────────────────────────────────────────────────
  {
    name: 'Dr. Priya Nair',
    specialty: 'Pediatrics',
    qualification: 'MBBS, MD (Pediatrics), DCH',
    experience: 12,
    rating: 4.8,
    reviewCount: 245,
    consultationFee: 600,
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    availableSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '15:00', '15:30', '16:00'],
    hospital: 'Fortis Malar Hospital, Chennai',
    bio: 'Compassionate pediatrician dedicated to comprehensive healthcare for children from birth through adolescence.',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Nair&background=8b5cf6&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Karthikeyan Selvamurugan',
    specialty: 'Pediatrics',
    qualification: 'MBBS, MD (Pediatrics), Fellowship in Neonatology',
    experience: 17,
    rating: 4.9,
    reviewCount: 388,
    consultationFee: 800,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00', '09:30', '10:00', '11:00', '14:00', '14:30'],
    hospital: 'Rainbow Children\'s Hospital, Chennai',
    bio: 'Neonatologist and pediatrician with vast experience in newborn intensive care, childhood infections, and developmental disorders.',
    avatar: 'https://ui-avatars.com/api/?name=Karthikeyan+S&background=7c3aed&color=fff',
    isAvailable: true,
  },

  // ── Psychiatry ────────────────────────────────────────────────────────────
  {
    name: 'Dr. Ananya Krishnan',
    specialty: 'Psychiatry',
    qualification: 'MBBS, MD (Psychiatry), MRCPsych',
    experience: 11,
    rating: 4.8,
    reviewCount: 135,
    consultationFee: 900,
    availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'],
    hospital: 'Mind Care Clinic, Chennai',
    bio: 'Compassionate psychiatrist specializing in mood disorders, anxiety, and cognitive behavioral therapy.',
    avatar: 'https://ui-avatars.com/api/?name=Ananya+Krishnan&background=f97316&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Murali Krishnaswamy',
    specialty: 'Psychiatry',
    qualification: 'MBBS, MD (Psychiatry), PhD (Neuroscience)',
    experience: 24,
    rating: 4.9,
    reviewCount: 490,
    consultationFee: 1200,
    availableDays: ['Tuesday', 'Thursday'],
    availableSlots: ['10:00', '10:30', '11:00', '11:30', '15:00', '15:30'],
    hospital: 'NIMHANS Affiliated Centre, Chennai',
    bio: 'Senior psychiatrist with expertise in schizophrenia, bipolar disorder, and addiction psychiatry. Author of 3 textbooks.',
    avatar: 'https://ui-avatars.com/api/?name=Murali+K&background=c2410c&color=fff',
    isAvailable: true,
  },

  // ── Pulmonology ───────────────────────────────────────────────────────────
  {
    name: 'Dr. Santhosh Raghunathan',
    specialty: 'Pulmonology',
    qualification: 'MBBS, MD (Respiratory Medicine), FCCP',
    experience: 16,
    rating: 4.8,
    reviewCount: 267,
    consultationFee: 900,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00', '09:30', '10:00', '11:00', '14:00', '14:30'],
    hospital: 'Chest Hospital, Chennai',
    bio: 'Pulmonologist specializing in asthma, COPD, interstitial lung diseases, and sleep-disordered breathing.',
    avatar: 'https://ui-avatars.com/api/?name=Santhosh+R&background=0f766e&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Usha Balasubramanian',
    specialty: 'Pulmonology',
    qualification: 'MBBS, MD (Pulmonary Medicine), DNB',
    experience: 12,
    rating: 4.7,
    reviewCount: 190,
    consultationFee: 800,
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    hospital: 'Apollo Hospital, Chennai',
    bio: 'Pulmonologist expert in bronchoscopy, pulmonary function testing, and critical care respiratory medicine.',
    avatar: 'https://ui-avatars.com/api/?name=Usha+B&background=115e59&color=fff',
    isAvailable: true,
  },

  // ── Radiology ─────────────────────────────────────────────────────────────
  {
    name: 'Dr. Arun Venkataramanan',
    specialty: 'Radiology',
    qualification: 'MBBS, MD (Radiology), FRCR',
    experience: 14,
    rating: 4.7,
    reviewCount: 142,
    consultationFee: 800,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    hospital: 'GEM Hospital, Chennai',
    bio: 'Interventional radiologist specializing in image-guided procedures, CT-guided biopsies, and vascular interventions.',
    avatar: 'https://ui-avatars.com/api/?name=Arun+V&background=1e40af&color=fff',
    isAvailable: true,
  },

  // ── Urology ───────────────────────────────────────────────────────────────
  {
    name: 'Dr. Manohar Reddy',
    specialty: 'Urology',
    qualification: 'MBBS, MS (General Surgery), MCh (Urology)',
    experience: 19,
    rating: 4.8,
    reviewCount: 334,
    consultationFee: 1000,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00'],
    hospital: 'Madras Medical Mission, Chennai',
    bio: 'Urologist with expertise in robotic-assisted surgery, kidney stone management, and urologic oncology.',
    avatar: 'https://ui-avatars.com/api/?name=Manohar+Reddy&background=1d4ed8&color=fff',
    isAvailable: true,
  },
  {
    name: 'Dr. Thirumurugan Palani',
    specialty: 'Urology',
    qualification: 'MBBS, MS, MCh (Urology), Fellowship in Andrology',
    experience: 13,
    rating: 4.7,
    reviewCount: 221,
    consultationFee: 850,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    hospital: 'Fortis Malar Hospital, Chennai',
    bio: 'Urologist specializing in male infertility, andrology, laparoscopic urology, and renal transplantation.',
    avatar: 'https://ui-avatars.com/api/?name=Thirumurugan+P&background=1e3a8a&color=fff',
    isAvailable: true,
  },
];

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
