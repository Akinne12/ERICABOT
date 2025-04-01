// src/commands/general/banner.js
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'banner',
  aliases: ['bn'],
  description: "Show a user's banner.",
  async execute(message, args) {
    try {
      const user = args.length > 0 ? message.mentions.users.first() : message.author;
      const fetchedUser = await message.client.users.fetch(user.id, { force: true });

      if (fetchedUser.banner) {
        const bannerURL = fetchedUser.bannerURL({ dynamic: true, size: 1024 });
        const embed = new MessageEmbed()
          .setTitle(`${fetchedUser.tag}'s Banner`)
          .setImage(bannerURL)
          .setColor('BLUE');
        message.channel.send({ embeds: [embed] });
      } else {
        message.reply('This user does not have a banner set.');
      }
    } catch (error) {
      console.error(error);
      message.reply('❗ Error fetching user banner.');
    }
  },
};