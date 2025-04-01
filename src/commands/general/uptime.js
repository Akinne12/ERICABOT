// src/commands/general/uptime.js
module.exports = {
    name: 'uptime',
    description: 'Show how long the bot has been online.',
    async execute(message) {
      try {
        const uptime = message.client.uptime;
        const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  
        message.channel.send(`🕰️ Bot Uptime: ${days}d ${hours}h ${minutes}m.`);
      } catch (error) {
        console.error('Error displaying uptime:', error);
        message.reply('❗ Error displaying uptime.');
      }
    },
  };