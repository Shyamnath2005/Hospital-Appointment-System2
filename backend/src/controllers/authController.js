const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const Patient = require('../models/Patient');
const logger = require('../config/logger');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, bloodGroup } = req.body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const patient = await Patient.create({
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
    });

    const token = generateToken(patient._id);

    logger.info(`New patient registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @desc    Login patient
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email }).select('+password');
    if (!patient || !(await patient.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!patient.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated.' });
    }

    const token = generateToken(patient._id);
    logger.info(`Patient logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @desc    Get current patient profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const patient = await Patient.findById(req.patient._id);
    res.json({ success: true, patient });
  } catch (error) {
    logger.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { register, login, getMe, registerValidation, loginValidation };
