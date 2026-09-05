require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

// Start server immediately on 0.0.0.0
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🏥 Hospital API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Asynchronous DB Connection
connectDB();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
});
