const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const logger = require('../config/logger');
const staticData = require('../data/doctorsData');

// @desc    Get all doctors with optional filtering
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const { specialty, search, hospital, location, page = 1, limit = 12, sortBy = 'rating' } = req.query;

    const query = { isAvailable: true };

    if (specialty && specialty !== 'All') {
      query.specialty = specialty;
    }

    if (hospital) {
      query.hospital = new RegExp(hospital.trim(), 'i');
    }

    if (location) {
      query.hospitalLocation = new RegExp(location.trim(), 'i');
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { hospital: searchRegex },
        { hospitalLocation: searchRegex },
        { specialty: searchRegex },
        { qualification: searchRegex },
      ];
    }

    const sortOptions = {
      rating: { rating: -1 },
      experience: { experience: -1 },
      fee_low: { consultationFee: 1 },
      fee_high: { consultationFee: -1 },
    };

    const limitNum = Number(limit);
    const pageNum = Number(page);
    const skip = (pageNum - 1) * limitNum;

    let total = 0;
    let doctors = [];

    if (mongoose.connection.readyState === 1) {
      try {
        total = await Doctor.countDocuments(query);
        if (total > 0) {
          doctors = await Doctor.find(query)
            .sort(sortOptions[sortBy] || { rating: -1 })
            .skip(skip)
            .limit(limitNum);
        }
      } catch (err) {
        logger.warn('MongoDB query warning in getDoctors:', err.message);
      }
    }

    if (doctors.length === 0 && total === 0) {
      let list = staticData.doctors.filter((d) => d.isAvailable !== false);
      if (specialty && specialty !== 'All') {
        list = list.filter((d) => d.specialty.toLowerCase() === specialty.toLowerCase());
      }
      if (hospital) {
        list = list.filter((d) => d.hospital.toLowerCase().includes(hospital.trim().toLowerCase()));
      }
      if (location) {
        list = list.filter((d) => d.hospitalLocation && d.hospitalLocation.toLowerCase().includes(location.trim().toLowerCase()));
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.hospital.toLowerCase().includes(q) ||
            (d.hospitalLocation && d.hospitalLocation.toLowerCase().includes(q)) ||
            d.specialty.toLowerCase().includes(q) ||
            d.qualification.toLowerCase().includes(q)
        );
      }

      if (sortBy === 'experience') list.sort((a, b) => b.experience - a.experience);
      else if (sortBy === 'fee_low') list.sort((a, b) => a.consultationFee - b.consultationFee);
      else if (sortBy === 'fee_high') list.sort((a, b) => b.consultationFee - a.consultationFee);
      else list.sort((a, b) => b.rating - a.rating);

      total = list.length;
      doctors = list.slice(skip, skip + limitNum).map((doc, i) => ({
        ...doc,
        _id: doc._id || `static-doc-${i + 1}`,
      }));
    }

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      doctors,
    });
  } catch (error) {
    logger.error('getDoctors error:', error);
    const limitNum = Number(req.query.limit) || 12;
    res.json({
      success: true,
      total: staticData.doctors.length,
      page: 1,
      pages: Math.ceil(staticData.doctors.length / limitNum) || 1,
      doctors: staticData.doctors.slice(0, limitNum).map((doc, i) => ({ ...doc, _id: doc._id || `static-doc-${i + 1}` })),
    });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    let doctor = null;
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && id.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        doctor = await Doctor.findById(id);
      } catch (err) {
        logger.warn('MongoDB findById warning:', err.message);
      }
    }

    if (!doctor) {
      if (id.startsWith('static-doc-')) {
        const idx = parseInt(id.replace('static-doc-', ''), 10) - 1;
        doctor = staticData.doctors[idx];
      }
      if (!doctor) {
        doctor = staticData.doctors.find((d) => String(d._id) === id || d.name.toLowerCase().includes(id.toLowerCase()));
      }
      if (doctor && !doctor._id) {
        doctor = { ...doctor, _id: id };
      }
    }

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    res.json({ success: true, doctor });
  } catch (error) {
    logger.error('getDoctorById error:', error);
    const doctor = staticData.doctors[0];
    res.json({ success: true, doctor: { ...doctor, _id: req.params.id } });
  }
};

// @desc    Get all specialties
// @route   GET /api/doctors/specialties
// @access  Public
const getSpecialties = async (req, res) => {
  try {
    let specialties = [];
    if (mongoose.connection.readyState === 1) {
      specialties = await Doctor.distinct('specialty');
    }
    if (!specialties || specialties.length === 0) {
      specialties = Array.from(new Set(staticData.doctors.map((d) => d.specialty)));
    }
    res.json({ success: true, specialties });
  } catch (error) {
    const specialties = Array.from(new Set(staticData.doctors.map((d) => d.specialty)));
    res.json({ success: true, specialties });
  }
};

// @desc    Get available slots for a doctor on a date
// @route   GET /api/doctors/:id/slots?date=YYYY-MM-DD
// @access  Public
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const Appointment = require('../models/Appointment');

    let doctor = null;
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && id.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(id);
    }
    if (!doctor) {
      if (id.startsWith('static-doc-')) {
        const idx = parseInt(id.replace('static-doc-', ''), 10) - 1;
        doctor = staticData.doctors[idx];
      }
      if (!doctor) {
        doctor = staticData.doctors.find((d) => String(d._id) === id);
      }
    }

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (doctor.availableDays && !doctor.availableDays.includes(dayName)) {
      return res.json({ success: true, slots: [] });
    }

    let bookedSlots = [];
    if (mongoose.connection.readyState === 1 && id.match(/^[0-9a-fA-F]{24}$/)) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const bookedAppointments = await Appointment.find({
        doctor: id,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' },
      }).select('timeSlot');

      bookedSlots = bookedAppointments.map((a) => a.timeSlot);
    }

    const allSlots = doctor.availableSlots || ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    res.json({ success: true, slots: availableSlots, bookedSlots });
  } catch (error) {
    logger.error('getAvailableSlots error:', error);
    const defaultSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
    res.json({ success: true, slots: defaultSlots, bookedSlots: [] });
  }
};

module.exports = { getDoctors, getDoctorById, getSpecialties, getAvailableSlots };
