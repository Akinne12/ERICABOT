const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    perf: 4,
    audit: 5
  },
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    // 1. app.log - General operations
    new transports.File({
      filename: path.join(__dirname, '../logs/app.log'),
      level: 'info',
      format: format.combine(
        format.printf(({ timestamp, level, message }) => 
          `${timestamp} [${level}]: ${message}`)
      )
    }),

    // 2. error.log - Errors only
    new transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error'
    }),

    // 3. debug.log - Debug info
    new transports.File({
      filename: path.join(__dirname, '../logs/debug.log'),
      level: 'debug',
      format: format.combine(
        format.printf(({ timestamp, level, message }) => 
          `${timestamp} [${level}]: ${message}`)
      )
    }),

    // 4. performance.log - Command timings
    new transports.File({
      filename: path.join(__dirname, '../logs/performance.log'),
      level: 'perf',
      format: format.combine(
        format.metadata(),
        format.printf(({ timestamp, message, metadata }) =>
          `${timestamp} [PERF] ${message} | ${JSON.stringify(metadata)}`)
      )
    }),

    // 5. audit.log - Structured audit trails
    new transports.File({
      filename: path.join(__dirname, '../logs/audit.log'),
      level: 'audit',
      format: format.json()
    }),

    // Console output
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message }) =>
          `${timestamp} [${level}]: ${message}`)
      )
    })
  ]
});

// Custom audit log methods
logger.audit = {
  premium: {
    add: (targetId, duration, issuerId, isGuild = false) => {
      logger.log('audit', {
        action: 'PREMIUM_ADD',
        target: targetId,
        type: isGuild ? 'GUILD' : 'USER',
        duration,
        issuer: issuerId,
        timestamp: new Date().toISOString()
      });
    },
    remove: (targetId, issuerId, isGuild = false) => {
      logger.log('audit', {
        action: 'PREMIUM_REMOVE',
        target: targetId,
        type: isGuild ? 'GUILD' : 'USER',
        issuer: issuerId,
        timestamp: new Date().toISOString()
      });
    },
    list: (issuerId, type, count) => {
      logger.log('audit', {
        action: 'PREMIUM_LIST',
        list_type: type,
        issuer: issuerId,
        item_count: count,
        timestamp: new Date().toISOString()
      });
    },
    fail: (issuerId, reason, metadata = {}) => {
      logger.log('audit', {
        action: 'PREMIUM_FAIL',
        reason,
        issuer: issuerId,
        ...metadata,
        timestamp: new Date().toISOString()
      });
    }
  },
  np: {
    add: (userId, duration, issuerId) => {
      logger.log('audit', {
        action: 'NP_ADD',
        user: userId,
        duration,
        issuer: issuerId,
        timestamp: new Date().toISOString()
      });
    },
    remove: (userId, issuerId) => {
      logger.log('audit', {
        action: 'NP_REMOVE',
        user: userId,
        issuer: issuerId,
        timestamp: new Date().toISOString()
      });
    },
    list: (issuerId, count) => {
      logger.log('audit', {
        action: 'NP_LIST',
        issuer: issuerId,
        user_count: count,
        timestamp: new Date().toISOString()
      });
    },
    fail: (issuerId, reason, metadata = {}) => {
      logger.log('audit', {
        action: 'NP_FAIL',
        reason,
        issuer: issuerId,
        ...metadata,
        timestamp: new Date().toISOString()
      });
    },
    expire: (userId) => {
      logger.log('audit', {
        action: 'NP_EXPIRE',
        user: userId,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Utility methods
logger.command = (msg) => logger.info(`CMD: ${msg}`);
logger.xp = (msg) => logger.debug(`XP: ${msg}`);
logger.vc = (msg) => logger.debug(`VC: ${msg}`);
logger.perf = (msg, meta) => logger.log('perf', msg, { metadata: meta });

// Shortcut for important events
logger.botEvent = (event, meta = {}) => {
  logger.log('audit', {
    action: 'BOT_EVENT',
    event,
    ...meta,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;