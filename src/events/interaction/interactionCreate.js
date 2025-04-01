
// interactionCreate.js
const { logger } = require('../../utils/logger');

module.exports = {
  name: 'interactionCreate',
  execute: async (interaction, client) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      return interaction.reply({ content: '❗ Command not found.', ephemeral: true });
    }

    try {
      await command.execute(interaction);
      logger.info(`⚡ Command ${interaction.commandName} executed by ${interaction.user.tag}`);
    } catch (error) {
      logger.error(`🚨 Error executing command: ${error.message}`);
      console.error(error);
      await interaction.reply({ content: '❗ An error occurred while executing this command.', ephemeral: true });
    }
  }
};

