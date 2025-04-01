//premiumService.js
const { Guild } = require('../database/models/Guild');
const { logger } = require('../utils/logger');

module.exports.checkPremium = async (userId, guildId) => {
  try {
    // Fetch the guild data from the database
    const guild = await Guild.findOne({ guildId });

    if (!guild) {
      logger.warn(`❗ Guild with ID ${guildId} not found.`);
      return false;
    }

    // Check if the user is in the premium list
    if (guild.premiumUsers && guild.premiumUsers.includes(userId)) {
      logger.info(`✨ Premium check passed for User ID ${userId} in Guild ID ${guildId}`);
      return true;
    } else {
      logger.info(`🚫 User ID ${userId} does not have premium in Guild ID ${guildId}`);
      return false;
    }
  } catch (error) {
    logger.error(`❗ Error checking premium status: ${error}`);
    return false;
  }
};
