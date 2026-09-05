const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.patient = await Patient.findById(decoded.id).select('-password');

    if (!req.patient) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired.',
    });
  }
};

module.exports = { protect };
