// src/commands/general/invite.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'invite',
  description: 'Get the bot invite link.',
  aliases: ['botinv'],
  execute: async (client, message) => {
    const inviteURL = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`;

    const embed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle('Invite Erica to Your Server!')
      .setDescription(`[Click here to invite me!](${inviteURL})`)
      .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

    message.channel.send({ embeds: [embed] });
  },
};
