// ./src/commands/bot-owner/premium-remove.js
const { EmbedBuilder } = require('discord.js');
const PremiumService = require('../../services/premiumService');

module.exports = {
  name: 'prm-',
  aliases: ['premium-'],
  description: 'Revoke premium access',
  usage: '<@user|guildID>',
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

    try {
      // Deactivate Premium
      const result = isGuild
        ? await PremiumService.deactivateGuild(args[0])
        : await PremiumService.deactivateUser(target.id);

      // Response
      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setDescription([
          `**🗑️ Premium Revoked**`,
          `• ${isGuild ? 'Guild' : 'User'}: ${isGuild ? args[0] : target.tag}`,
          `• Removed by: ${message.author.tag}`
        ].join('\n'));

      message.client.logger.audit.premium.remove(
        isGuild ? args[0] : target.id,
        message.author.id,
        isGuild
      );

      return message.reply({ embeds: [embed] });
    } catch (error) {
      message.client.logger.error('Premium remove failed:', error);
      message.client.logger.audit.premium.fail(
        message.author.id,
        'EXECUTION_ERROR',
        { error: error.message }
      );
      return message.reply('❌ Failed to revoke premium');
    }
  }
};