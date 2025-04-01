//premiumService.js
const logger = require('../utils/logger');
const { parseDuration } = require('../utils/timeParser');
const { Op } = require('sequelize');

class PremiumService {
  /**
   * Activate premium for a user
   * @param {string} userId - Discord user ID
   * @param {string} duration - Duration string (e.g. "30d")
   * @param {string} issuerId - Who granted this premium
   * @param {string|null} guildId - Null for global premium
   * @returns {Promise<Object>} Created premium record
   */
  static async activateUser(userId, duration, issuerId, guildId = null) {
    const expiresAt = new Date(Date.now() + parseDuration(duration));
    
    const [record, created] = await db.PremiumUser.findOrCreate({
      where: { 
        userId,
        [Op.or]: [
          { guildId: guildId || null },
          { expiresAt: { [Op.lt]: new Date() } }
        ]
      },
      defaults: {
        userId,
        guildId,
        expiresAt,
        issuerId,
        multiplier: guildId ? 1.5 : 2.0 // Higher multiplier for global
      }
    });

    if (!created) {
      await record.update({ expiresAt, issuerId });
    }

    logger.audit.premium.add(userId, duration, issuerId, false);
    return record;
  }

  /**
   * Activate premium for a guild
   * @param {string} guildId - Discord guild ID
   * @param {string} duration - Duration string
   * @param {string} issuerId - Who granted this
   * @returns {Promise<Object>} Created premium record
   */
  static async activateGuild(guildId, duration, issuerId) {
    const expiresAt = new Date(Date.now() + parseDuration(duration));
    const guild = await client.guilds.fetch(guildId).catch(() => null);

    const [record, created] = await db.PremiumGuild.findOrCreate({
      where: { 
        guildId,
        [Op.or]: [
          { expiresAt: { [Op.lt]: new Date() } }
        ]
      },
      defaults: {
        guildId,
        guildName: guild?.name || 'Unknown Server',
        expiresAt,
        issuerId,
        multiplier: 1.5
      }
    });

    if (!created) {
      await record.update({ 
        expiresAt,
        issuerId,
        guildName: guild?.name || record.guildName
      });
    }

    logger.audit.premium.add(guildId, duration, issuerId, true);
    return record;
  }

  /**
   * Deactivate user premium
   * @param {string} userId - Discord user ID
   * @param {string|null} guildId - Null for global premium
   * @returns {Promise<boolean>} Whether premium was removed
   */
  static async deactivateUser(userId, guildId = null) {
    const deleted = await db.PremiumUser.destroy({
      where: { userId, guildId: guildId || null }
    });

    if (deleted) {
      logger.audit.premium.remove(userId, 'system', false);
    }
    return deleted > 0;
  }

  /**
   * Deactivate guild premium
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<boolean>} Whether premium was removed
   */
  static async deactivateGuild(guildId) {
    const deleted = await db.PremiumGuild.destroy({
      where: { guildId }
    });

    if (deleted) {
      logger.audit.premium.remove(guildId, 'system', true);
    }
    return deleted > 0;
  }

  /**
   * Get all active premium users
   * @returns {Promise<Array>} List of premium users
   */
  static async getAllPremiumUsers() {
    return await db.PremiumUser.findAll({
      where: {
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['expiresAt', 'ASC']]
    });
  }

  /**
   * Get all active premium guilds
   * @returns {Promise<Array>} List of premium guilds
   */
  static async getAllPremiumGuilds() {
    return await db.PremiumGuild.findAll({
      where: {
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['expiresAt', 'ASC']]
    });
  }

  /**
   * Check if user has premium
   * @param {string} userId - Discord user ID
   * @param {string|null} guildId - Null checks global premium
   * @returns {Promise<boolean>} Whether user has premium
   */
  static async checkUserPremium(userId, guildId = null) {
    const record = await db.PremiumUser.findOne({
      where: {
        userId,
        [Op.or]: [
          { guildId: guildId || null },
          { guildId: null } // Global premium
        ],
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    return !!record;
  }

  /**
   * Get user's premium multiplier
   * @param {string} userId - Discord user ID
   * @param {string|null} guildId - Guild context
   * @returns {Promise<number>} XP multiplier (1.0 for no premium)
   */
  static async getUserMultiplier(userId, guildId = null) {
    const records = await db.PremiumUser.findAll({
      where: {
        userId,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    // Priority: Guild-specific > Global
    const guildPremium = records.find(r => r.guildId === guildId);
    const globalPremium = records.find(r => r.guildId === null);

    return guildPremium?.multiplier || globalPremium?.multiplier || 1.0;
  }

  /**
   * Cleanup expired premium records
   * @returns {Promise<number>} Number of records cleaned
   */
  static async cleanupExpired() {
    const userDeletions = await db.PremiumUser.destroy({
      where: { expiresAt: { [Op.lt]: new Date() } }
    });

    const guildDeletions = await db.PremiumGuild.destroy({
      where: { expiresAt: { [Op.lt]: new Date() } }
    });

    if (userDeletions > 0 || guildDeletions > 0) {
      logger.info(`Cleaned up ${userDeletions} user and ${guildDeletions} guild premium records`);
    }

    return userDeletions + guildDeletions;
  }
}

// Initialize cleanup interval (runs daily)
setInterval(() => PremiumService.cleanupExpired(), 86400000).unref();

module.exports = PremiumService;