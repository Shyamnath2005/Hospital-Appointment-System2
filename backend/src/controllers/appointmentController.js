const { body } = require('express-validator');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const logger = require('../config/logger');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, reason } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Check for double booking
    const existing = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $ne: 'cancelled' },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose another slot.',
      });
    }

    const appointment = await Appointment.create({
      patient: req.patient._id,
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      reason,
      consultationFee: doctor.consultationFee,
    });

    await appointment.populate(['doctor', 'patient']);

    logger.info(`Appointment booked: Patient ${req.patient.email} with Dr. ${doctor.name}`);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment,
    });
  } catch (error) {
    logger.error('bookAppointment error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This slot is already taken. Please select another time.',
      });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get patient's appointment history
// @route   GET /api/appointments/my
// @access  Private
const getMyAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { patient: req.patient._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialty avatar hospital consultationFee')
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      appointments,
    });
  } catch (error) {
    logger.error('getMyAppointments error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.patient._id,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed appointment.' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled successfully.', appointment });
  } catch (error) {
    logger.error('cancelAppointment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Validation
const bookAppointmentValidation = [
  body('doctorId').notEmpty().withMessage('Doctor ID is required'),
  body('appointmentDate').isDate().withMessage('Valid appointment date is required'),
  body('timeSlot').notEmpty().withMessage('Time slot is required'),
  body('reason').trim().notEmpty().withMessage('Reason for appointment is required'),
];

module.exports = { bookAppointment, getMyAppointments, cancelAppointment, bookAppointmentValidation };
