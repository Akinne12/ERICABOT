// ./src/commands/bot-owner/premium-list-guilds.js
const { EmbedBuilder } = require('discord.js');
const PremiumService = require('../../services/premiumService');
const paginate = require('../../utils/paginator');

module.exports = {
  name: 'prm lg',
  aliases: ['premium list guilds'],
  description: 'List premium guilds',
  async execute(message) {
    // Permission Check
    if (message.author.id !== message.client.config.permissions.owner_id) {
      message.client.logger.audit.premium.fail(message.author.id, 'PERMISSION_DENIED');
      return message.reply('❌ Bot owner only');
    }

    try {
      const guilds = await PremiumService.getAllPremiumGuilds();
      
      // Format entries
      const entries = guilds.map(g => 
        `• ${g.guildName} (${g.guildId})\n` +
        `↳ Expires: <t:${Math.floor(g.expiresAt.getTime() / 1000)}:R>\n` +
        `↳ Boost: ${g.multiplier}x`
      );

      // Paginate if >5 entries
      if (entries.length > 5) {
        return paginate(message, entries, {
          title: '🏆 Premium Guilds',
          color: 0x5865F2,
          pageSize: 5
        });
      }

      // Single embed for small lists
      const embed = new EmbedBuilder()
        .setTitle(`Premium Guilds (${entries.length})`)
        .setColor(0x5865F2)
        .setDescription(entries.join('\n\n') || 'No premium guilds found');

      message.client.logger.audit.premium.list(
        message.author.id,
        'GUILDS',
        { count: entries.length }
      );

      return message.reply({ embeds: [embed] });
    } catch (error) {
      message.client.logger.error('Guild list failed:', error);
      return message.reply('❌ Failed to fetch premium guilds');
    }
  }
};