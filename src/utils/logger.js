const { createLogger, format, transports } = require('winston');
const path = require('path');

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
);

const logger = createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new transports.File({ filename: path.join(__dirname, '../../logs/app.log'), level: 'info' }),
    new transports.File({ filename: path.join(__dirname, '../../logs/error.log'), level: 'error' }),
    new transports.File({ filename: path.join(__dirname, '../../logs/debug.log'), level: 'debug' }),
    new transports.Console()
  ]
});

// Export functions directly
const logError = (message) => logger.error(message);
const logInfo = (message) => logger.info(message);
const logDebug = (message) => logger.debug(message);

module.exports = {
  logger,
  logError,
  logInfo,
  logDebug
};
