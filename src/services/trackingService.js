//trackingServices.js
const { User } = require('../database/models/User');
const { logger } = require('../utils/logger');

module.exports.trackMessage = async (userId) => {
  try {
    const user = await User.findOneAndUpdate(
      { userId },
      { $inc: { messages: 1 } },
      { upsert: true, new: true }
    );

    logger.info(`📝 Message tracked for User ID ${userId}. Total Messages: ${user.messages}`);
  } catch (error) {
    logger.error(`❗ Error tracking message for User ID ${userId}: ${error}`);
  }
};
const { VoiceConnection } = require('discord.js'); // For tracking voice states

module.exports.trackVoice = async (userId, voiceMinutes) => {
  try {
    const user = await User.findOneAndUpdate(
      { userId },
      { $inc: { voiceMinutes } },
      { upsert: true, new: true }
    );

    logger.info(`🎙️ Voice minutes tracked for User ID ${userId}. Total Voice Minutes: ${user.voiceMinutes}`);
  } catch (error) {
    logger.error(`❗ Error tracking voice minutes for User ID ${userId}: ${error}`);
  }
};
const { Guild } = require('../database/models/Guild');

module.exports.trackInvite = async (guildId, inviterId) => {
  try {
    const guild = await Guild.findOneAndUpdate(
      { guildId },
      { $inc: { [`invites.${inviterId}`]: 1 } },
      { upsert: true, new: true }
    );

    logger.info(`🎟️ Invite tracked for Guild ID ${guildId}. Inviter ID: ${inviterId}. Total Invites: ${guild.invites.get(inviterId)}`);
  } catch (error) {
    logger.error(`❗ Error tracking invite in Guild ID ${guildId}: ${error}`);
  }
};
