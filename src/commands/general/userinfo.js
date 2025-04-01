// src/commands/general/userinfo.js
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'userinfo',
  aliases: ['ui'],
  description: 'Show details about a user.',
  async execute(message, args) {
    try {
      const user = args.length > 0 ? message.mentions.users.first() || await message.client.users.fetch(args[0]) : message.author;
      const member = await message.guild.members.fetch(user.id);

      const embed = new MessageEmbed()
        .setColor('GREEN')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setTitle(`User Info for ${user.tag}`)
        .addFields(
          { name: 'Username', value: `${user.tag}`, inline: true },
          { name: 'User ID', value: `${user.id}`, inline: true },
          { name: 'Joined Server', value: `${member.joinedAt}`, inline: true },
          { name: 'Account Created', value: `${user.createdAt}`, inline: true },
          { name: 'Status', value: `${member.presence?.status || 'offline'}`, inline: true }
        )
        .setFooter(`Requested by ${message.author.tag}`)
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('❗ Error fetching user info. Ensure the user exists and I have sufficient permissions.');
    }
  },
};
