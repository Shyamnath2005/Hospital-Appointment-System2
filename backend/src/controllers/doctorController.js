const Doctor = require('../models/Doctor');
const logger = require('../config/logger');

// @desc    Get all doctors with optional filtering
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const { specialty, search, page = 1, limit = 12, sortBy = 'rating' } = req.query;

    const query = { isAvailable: true };

    if (specialty) query.specialty = specialty;
    if (search) query.$text = { $search: search };

    const sortOptions = {
      rating: { rating: -1 },
      experience: { experience: -1 },
      fee_low: { consultationFee: 1 },
      fee_high: { consultationFee: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .sort(sortOptions[sortBy] || { rating: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      doctors,
    });
  } catch (error) {
    logger.error('getDoctors error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    res.json({ success: true, doctor });
  } catch (error) {
    logger.error('getDoctorById error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all specialties
// @route   GET /api/doctors/specialties
// @access  Public
const getSpecialties = async (req, res) => {
  try {
    const specialties = await Doctor.distinct('specialty');
    res.json({ success: true, specialties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get available slots for a doctor on a date
// @route   GET /api/doctors/:id/slots?date=YYYY-MM-DD
// @access  Public
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const Appointment = require('../models/Appointment');

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!doctor.availableDays.includes(dayName)) {
      return res.json({ success: true, slots: [] });
    }

    // Get booked slots for that date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: req.params.id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' },
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map((a) => a.timeSlot);
    const availableSlots = doctor.availableSlots.filter((slot) => !bookedSlots.includes(slot));

    res.json({ success: true, slots: availableSlots, bookedSlots });
  } catch (error) {
    logger.error('getAvailableSlots error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDoctors, getDoctorById, getSpecialties, getAvailableSlots };
