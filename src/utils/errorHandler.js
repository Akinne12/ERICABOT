const fs = require('fs').promises;
const logger = require('./logger');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  handleError: async (error, context = {}) => {
    const errorMessage = error.stack || error.toString();
    logger.error(`[${context.operation || 'UNKNOWN'}] ${errorMessage}`);

    // Log to file
    try {
      await fs.appendFile(
        'logs/error.log', 
        `${new Date().toISOString()} - ${context.operation || 'ERROR'}: ${errorMessage}\n`
      );
    } catch (err) {
      logger.error(`Failed to log error: ${err}`);
    }

    // Discord response
    if (context.channel?.isTextBased()) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('⚠️ Error')
        .setDescription('An error occurred. The team has been notified.')
        .addFields({
          name: 'Operation',
          value: context.operation || 'Not specified'
        });
      
      await context.channel.send({ embeds: [embed] });
    }
  }
};