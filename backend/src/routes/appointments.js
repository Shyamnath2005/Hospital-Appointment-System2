const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  bookAppointmentValidation,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect); // All appointment routes require authentication

router.post('/', bookAppointmentValidation, validate, bookAppointment);
router.get('/my', getMyAppointments);
router.put('/:id/cancel', cancelAppointment);

module.exports = router;
