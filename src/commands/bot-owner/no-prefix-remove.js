// ./src/commands/bot-owner/no-prefix-remove.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'noprefix-',
  aliases: ['np-'],
  description: 'Revoke no-prefix access from a user',
  usage: '<@user>',
  async execute(message, args) {
    // 1. Permission Check
    const { owner_id, trusted_users, no_prefix_users } = message.client.config.permissions;
    const isAuthorized = [owner_id, ...trusted_users].includes(message.author.id);
    
    if (!isAuthorized) {
      message.client.logger.audit.np.fail(message.author.id, 'PERMISSION_DENIED');
      return message.reply('❌ Only bot owner/trusted users can use this');
    }

    // 2. Parse Target User
    const targetUser = message.mentions.users.first();
    if (!targetUser) {
      message.client.logger.audit.np.fail(message.author.id, 'INVALID_TARGET');
      return message.reply('❌ Please tag a user');
    }

    // 3. Update Config
    const userId = targetUser.id;
    const index = no_prefix_users.indexOf(userId);
    
    if (index > -1) {
      no_prefix_users.splice(index, 1);
      
      // Save Config
      require('fs').writeFileSync(
        './.vscode/config.json',
        JSON.stringify(message.client.config, null, 2)
      );

      // 4. Log & Respond
      message.client.logger.audit.np.remove(userId, message.author.id);
      
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription([
          `**🗑️ No-Prefix Access Revoked**`,
          `• User: ${targetUser.tag} (${userId})`,
          `• Removed by: ${message.author.tag}`
        ].join('\n'));

      return message.reply({ embeds: [embed] });
    } else {
      message.client.logger.audit.np.fail(message.author.id, 'NOT_FOUND', { userId });
      return message.reply(`⚠️ ${targetUser.tag} didn't have no-prefix access`);
    }
  }
};