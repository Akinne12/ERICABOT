// ./src/commands/bot-owner/shutdown.js
const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  name: 'shutdown',
  description: 'Safely shutdown the bot (Owner only)',
  aliases: ['restart', 'kill'],
  async execute(message) {
    // 1. Permission Check
    if (message.author.id !== message.client.config.permissions.owner_id) {
      logger.audit.bot.fail(message.author.id, 'SHUTDOWN_UNAUTHORIZED');
      return message.reply('❌ Bot owner only');
    }

    // 2. Confirmation Embed
    const confirmEmbed = new EmbedBuilder()
      .setColor(0xFFA500)
      .setTitle('⚠️ Confirm Shutdown')
      .setDescription('This will terminate the bot process. Continue?')
      .setFooter({ text: 'Reply with "confirm" within 30 seconds to proceed' });

    const confirmation = await message.reply({ embeds: [confirmEmbed] });

    // 3. Confirmation Collector
    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ 
      filter, 
      time: 30000,
      max: 1 
    });

    collector.on('collect', async m => {
      if (m.content.toLowerCase() !== 'confirm') {
        await message.reply('🚫 Shutdown canceled');
        logger.audit.bot.cancel(message.author.id);
        return;
      }

      // 4. Pre-Shutdown Tasks
      const shutdownEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🛑 Bot Shutting Down')
        .setDescription(`
          • Saving data...
          • Disconnecting from Discord...
          • ${message.client.guilds.cache.size} servers affected
        `);

      await message.reply({ embeds: [shutdownEmbed] });

      // 5. Perform Cleanup
      try {
        // Save any pending data
        await message.client.db.close(); // If using database
        
        // Log shutdown
        logger.audit.bot.shutdown(message.author.id, {
          guilds: message.client.guilds.cache.size,
          uptime: formatUptime(message.client.uptime)
        });

        // Notify specific channels (optional)
        await notifyAdminChannels(message.client);
        
      } catch (error) {
        logger.error('Shutdown cleanup failed:', error);
      }

      // 6. Terminate Process
      process.exit(0);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.reply('🕒 Shutdown timed out').catch(console.error);
      }
    });
  }
};

// Helper Functions
async function notifyAdminChannels(client) {
  const channels = client.config.shutdown_notify_channels || [];
  await Promise.all(channels.map(async channelId => {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (channel?.isTextBased()) {
      await channel.send({
        embeds: [new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('🔌 Bot Maintenance')
          .setDescription('The bot is undergoing scheduled shutdown/restart')
          .setFooter({ text: 'Estimated downtime: 2-5 minutes' })
        ]
      }).catch(() => {});
    }
  }));
}

function formatUptime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}