// ./src/commands/bot-owner/no-prefix-add.js
const { EmbedBuilder } = require('discord.js');
const { parseDuration, formatDuration } = require('../../utils/timeParser');

module.exports = {
  name: 'noprefix+',
  aliases: ['np+'],
  description: 'Grant no-prefix access to a user',
  usage: '<@user> <duration>',
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
    if (!targetUser || targetUser.bot) {
      message.client.logger.audit.np.fail(message.author.id, 'INVALID_TARGET');
      return message.reply('❌ Please tag a valid user (not a bot)');
    }

    // 3. Parse Duration (Default: 30d if omitted)
    const durationInput = args[1] || '30d'; 
    const durationMs = parseDuration(durationInput);
    
    if (!durationMs || durationMs > 365 * 86400000) { // Max 1 year
      message.client.logger.audit.np.fail(message.author.id, 'INVALID_DURATION', { input: durationInput });
      return message.reply('❌ Invalid duration (e.g. `30d`, `90d`, max 365d)');
    }

    // 4. Update Config
    const userId = targetUser.id;
    if (!no_prefix_users.includes(userId)) {
      // Add to no-prefix list
      no_prefix_users.push(userId);
      
      // Auto-remove after duration
      setTimeout(() => {
        const index = no_prefix_users.indexOf(userId);
        if (index > -1) {
          no_prefix_users.splice(index, 1);
          message.client.logger.audit.np.expire(userId);
        }
      }, durationMs);

      // 5. Save Config (if using persistent storage)
      require('fs').writeFileSync(
        './.vscode/config.json',
        JSON.stringify(message.client.config, null, 2)
      );

      // 6. Log & Respond
      message.client.logger.audit.np.add(userId, durationInput, message.author.id);
      
      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setDescription([
          `**✅ No-Prefix Access Granted**`,
          `• User: ${targetUser.tag} (${userId})`,
          `• Duration: ${formatDuration(durationMs)}`,
          `• Issued by: ${message.author.tag}`,
          `• Auto-removes: <t:${Math.floor((Date.now() + durationMs) / 1000)}:R>`
        ].join('\n'));

      return message.reply({ embeds: [embed] });
    } else {
      message.client.logger.audit.np.fail(message.author.id, 'DUPLICATE_ENTRY', { userId });
      return message.reply(`⚠️ ${targetUser.tag} already has no-prefix access`);
    }
  }
};