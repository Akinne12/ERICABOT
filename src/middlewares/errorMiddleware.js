// errorMiddleware.js
const { logger } = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Log the error
  logger.error(`❗ Error: ${err.message || err}`);

  // Send a generic error response
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
};

module.exports = errorMiddleware;