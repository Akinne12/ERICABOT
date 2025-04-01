// ./src/commands/bot-owner/premium-add.js
const { EmbedBuilder } = require('discord.js');
const { parseDuration, formatDuration } = require('../../utils/timeParser');
const PremiumService = require('../../services/premiumService');

module.exports = {
  name: 'prm+',
  aliases: ['premium+'],
  description: 'Grant premium access',
  usage: '<@user|guildID> <duration>',
  async execute(message, args) {
    // Permission Check
    if (message.author.id !== message.client.config.permissions.owner_id) {
      message.client.logger.audit.premium.fail(message.author.id, 'PERMISSION_DENIED');
      return message.reply('❌ Bot owner only');
    }

    // Parse Target
    const target = message.mentions.users.first() || 
                 (args[0]?.match(/^\d+$/) ? { id: args[0] } : null);
    const isGuild = !message.mentions.users.size && args[0]?.match(/^\d+$/);

    if (!target && !isGuild) {
      message.client.logger.audit.premium.fail(message.author.id, 'INVALID_TARGET');
      return message.reply('❌ Mention user or provide guild ID');
    }

    // Parse Duration (default: 30d from config)
    const duration = args[1] || message.client.config.premium.default_duration;
    const ms = parseDuration(duration);
    if (!ms) {
      message.client.logger.audit.premium.fail(message.author.id, 'INVALID_DURATION', { duration });
      return message.reply('❌ Invalid duration (e.g. 30d, 90d)');
    }

    try {
      // Activate Premium
      const result = isGuild
        ? await PremiumService.activateGuild(args[0], duration, message.author.id)
        : await PremiumService.activateUser(target.id, duration, message.author.id);

      // Response
      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setDescription([
          `**🌟 Premium Activated**`,
          `• ${isGuild ? 'Guild' : 'User'}: ${isGuild ? args[0] : target.tag}`,
          `• Duration: ${formatDuration(ms)}`,
          `• Expires: <t:${Math.floor((Date.now() + ms) / 1000)}:R>`,
          `• Issued by: ${message.author.tag}`
        ].join('\n'));

      message.client.logger.audit.premium.add(
        isGuild ? args[0] : target.id,
        duration,
        message.author.id,
        isGuild
      );

      return message.reply({ embeds: [embed] });
    } catch (error) {
      message.client.logger.error('Premium add failed:', error);
      message.client.logger.audit.premium.fail(
        message.author.id,
        'EXECUTION_ERROR',
        { error: error.message }
      );
      return message.reply('❌ Failed to activate premium');
    }
  }
};