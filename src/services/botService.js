//botService.js
const { logger } = require('../utils/logger');
module.exports.handleMessage = async (client, message) => {
  const { noprefix } = client.config;
  if (message.author.bot || !message.guild) return;

  const prefix = client.config.prefix;
  let args, commandName;

  if (noprefix.owner_id === message.author.id || noprefix.trusted === message.author.id) {
    args = message.content.trim().split(/\s+/);
    commandName = args.shift().toLowerCase();
  } else if (message.content.startsWith(prefix)) {
    args = message.content.slice(prefix.length).trim().split(/\s+/);
    commandName = args.shift().toLowerCase();
  } else {
    return;
  }

  const command = client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  try {
    await command.execute(client, message, args);
    client.logger.info(`✅ Command executed: ${command.name}`);
  } catch (error) {
    client.logger.error(`❗ Error executing ${command.name} command:`, error);
    message.reply('An error occurred while executing the command.');
  }
};
