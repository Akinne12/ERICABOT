//statsService.js
const { User } = require('../database/models/User');
const { logger } = require('../utils/logger');

module.exports.getUserStats = async (userId) => {
  try {
    // Find user data in the database
    const user = await User.findOne({ userId });

    if (!user) {
      logger.warn(`❗ User with ID ${userId} not found.`);
      return { messages: 0, voiceMinutes: 0 };
    }

    // Return user stats
    logger.info(`📊 Retrieved stats for User ID ${userId}`);
    return {
      messages: user.messages || 0,
      voiceMinutes: user.voiceMinutes || 0,
    };
  } catch (error) {
    logger.error(`❗ Error retrieving user stats: ${error}`);
    return { messages: 0, voiceMinutes: 0 };
  }
};
