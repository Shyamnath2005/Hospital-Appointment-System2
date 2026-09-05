const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, getSpecialties, getAvailableSlots } = require('../controllers/doctorController');

router.get('/specialties', getSpecialties);
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getAvailableSlots);

module.exports = router;
