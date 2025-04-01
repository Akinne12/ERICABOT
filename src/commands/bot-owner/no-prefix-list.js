// ./src/commands/bot-owner/no-prefix-list.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'noprefix list',
  aliases: ['np list'],
  description: 'List all users with no-prefix access',
  async execute(message) {
    // 1. Permission Check
    const { owner_id, trusted_users, no_prefix_users } = message.client.config.permissions;
    const isAuthorized = [owner_id, ...trusted_users].includes(message.author.id);
    
    if (!isAuthorized) {
      message.client.logger.audit.np.fail(message.author.id, 'PERMISSION_DENIED');
      return message.reply('❌ Only bot owner/trusted users can use this');
    }

    // 2. Fetch User Details
    const users = await Promise.all(
      no_prefix_users.map(async id => {
        try {
          const user = await message.client.users.fetch(id);
          return `${user.tag} (${id})`;
        } catch {
          return `[Unknown User] (${id})`;
        }
      })
    );

    // 3. Log Access
    message.client.logger.audit.np.list(message.author.id, no_prefix_users.length);

    // 4. Send Response
    const embed = new EmbedBuilder()
      .setColor(0x7289DA)
      .setTitle(`🔓 No-Prefix Users (${users.length})`)
      .setDescription(users.join('\n') || '*No users have no-prefix access*');

    return message.reply({ embeds: [embed] });
  }
};