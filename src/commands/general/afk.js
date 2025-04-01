// src/commands/general/afk.js
const afkUsers = new Map();

module.exports = {
  name: 'afk',
  description: 'Set yourself as AFK (optional DM notification when mentioned).',
  async execute(message, args) {
    const user = message.author;
    const reason = args.join(' ') || 'AFK';

    if (afkUsers.has(user.id)) {
      afkUsers.delete(user.id);
      message.reply('You are no longer AFK!');
    } else {
      afkUsers.set(user.id, { reason, timestamp: Date.now() });
      message.reply(`You are now AFK. Reason: ${reason}`);
    }

    message.client.on('messageCreate', (msg) => {
      if (msg.mentions.has(user) && afkUsers.has(user.id)) {
        const afkInfo = afkUsers.get(user.id);
        const elapsedTime = Math.floor((Date.now() - afkInfo.timestamp) / 60000);
        msg.reply(`🟡 ${user.tag} is currently AFK: ${afkInfo.reason}. (AFK for ${elapsedTime} minutes)`);
      }
    });
  },
};