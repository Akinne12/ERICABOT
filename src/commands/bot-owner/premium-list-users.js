// ./src/commands/bot-owner/premium-list-users.js
const { EmbedBuilder } = require('discord.js');
const PremiumService = require('../../services/premiumService');
const paginate = require('../../utils/paginator');

module.exports = {
  name: 'prm lu',
  aliases: ['premium list users'],
  description: 'List premium users',
  async execute(message) {
    // Permission Check
    if (message.author.id !== message.client.config.permissions.owner_id) {
      message.client.logger.audit.premium.fail(message.author.id, 'PERMISSION_DENIED');
      return message.reply('❌ Bot owner only');
    }

    try {
      const users = await PremiumService.getAllPremiumUsers();
      
      // Format entries
      const entries = users.map(u => 
        `• <@${u.userId}> (${u.userId})\n` +
        `↳ Expires: <t:${Math.floor(u.expiresAt.getTime() / 1000)}:R>\n` +
        `↳ Boost: ${u.multiplier}x`
      );

      // Paginate if >5 entries
      if (entries.length > 5) {
        return paginate(message, entries, {
          title: '🌟 Premium Users',
          color: 0xFFD700,
          pageSize: 5
        });
      }

      // Single embed for small lists
      const embed = new EmbedBuilder()
        .setTitle(`Premium Users (${entries.length})`)
        .setColor(0xFFD700)
        .setDescription(entries.join('\n\n') || 'No premium users found');

      message.client.logger.audit.premium.list(
        message.author.id,
        'USERS',
        { count: entries.length }
      );

      return message.reply({ embeds: [embed] });
    } catch (error) {
      message.client.logger.error('Premium list failed:', error);
      return message.reply('❌ Failed to fetch premium users');
    }
  }
};