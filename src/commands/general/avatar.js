// src/commands/general/avatar.js
module.exports = {
    name: 'avatar',
    aliases: ['av'],
    description: 'Get a user\'s avatar.',
    async execute(message, args) {
      try {
        const user = args.length > 0 ? message.mentions.users.first() : message.author;
        if (!user) return message.reply('❗ Please mention a valid user.');
  
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
        await message.channel.send(`${user.tag}'s Avatar: ${avatarURL}`);
      } catch (error) {
        console.error('Error displaying avatar:', error);
        message.reply('❗ Error displaying avatar.');
      }
    },
  };
  