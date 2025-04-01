// src/commands/general/help.js
module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'Display the list of commands.',
    async execute(message) {
      try {
        const commands = [
          '-help (-h): Display the list of commands.',
          '-userinfo <@user> (-ui <@user>): Show details about a user.',
          '-serverinfo (-si): Show server details.',
          '-ping: Check bot latency.',
          '-uptime: Show how long the bot has been online.',
          '-avatar <@user> (-av <@user>): Get a user\'s avatar.',
          '-banner <@user>: Show a user\'s banner.',
          '-invite: Get the bot\'s invite link.',
          '-afk: Set yourself as AFK (optional DM notification when mentioned).',
        ];
  
        const helpMessage = commands.join('\n');
        await message.channel.send(`**Available Commands**:\n${helpMessage}`);
      } catch (error) {
        console.error('Error displaying help:', error);
        message.reply('❗ Error displaying help menu.');
      }
    },
  };
  