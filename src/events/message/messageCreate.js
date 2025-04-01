const { logger } = require('../../utils/logger');
const config = require('../../../.vscode/config.json');
const { noprefix } = config;

module.exports = {
  name: 'messageCreate',
  async execute(client, message) {
    if (!message || !message.author || message.author.bot || !message.guild) return;

    const prefix = client.config.prefix;
    let args, commandName;

    // Check for No Prefix permissions
    if (
      noprefix.owner_id === message.author.id || 
      (Array.isArray(noprefix.trusted) && noprefix.trusted.includes(message.author.id))
    ) {
      args = message.content.trim().split(/\s+/);
      commandName = args.shift().toLowerCase();
    } else if (message.content.startsWith(prefix)) {
      args = message.content.slice(prefix.length).trim().split(/\s+/);
      commandName = args.shift().toLowerCase();
    } else {
      return; // Ignore messages without the prefix
    }

    const command = client.commands.get(commandName) ||
      client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
      await command.execute(client, message, args);
      logger.info(`✅ Command executed: ${command.name}`);
    } catch (error) {
      logger.error(`❗ Error executing ${command.name || commandName} command:`, error);
      message.reply(`An error occurred while executing the \`${commandName}\` command.`);
    }
  },
};
