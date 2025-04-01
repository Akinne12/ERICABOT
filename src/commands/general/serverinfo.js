// Import necessary utilities
const { logError } = require('../../utils/logger');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'serverinfo',
    aliases: ['si'], // Adding the alias 'si' here
    description: 'Shows information about the server',
    async execute(message, args) {
        const guild = message.guild;

        // Fetch data
        try {
            // Fetch the owner using the ownerId directly
            const owner = await guild.members.fetch(guild.ownerId).catch((error) => {
                logError('Failed to fetch guild owner:', error);
                return null;
            });

            const memberCount = guild.memberCount;
            const bannedMembers = await guild.bans.fetch().then(bans => bans.size).catch((error) => {
                logError('Failed to fetch banned members:', error);
                return 0;
            });
            const activeInvites = await guild.invites.fetch().then(invites => invites.size).catch((error) => {
                logError('Failed to fetch active invites:', error);
                return 0;
            });
            const vanityURL = guild.vanityURLCode || 'None';
            const premiumSubscriptionCount = guild.premiumSubscriptionCount || 0;
            const premiumTier = guild.premiumTier || 0;
            const features = guild.features.length > 0 ? guild.features.join(', ') : 'None';
            const channels = guild.channels.cache;
            const textChannels = channels.filter(c => c.type === 'GUILD_TEXT').size;
            const voiceChannels = channels.filter(c => c.type === 'GUILD_VOICE').size;
            const categories = channels.filter(c => c.type === 'GUILD_CATEGORY').size;
            const announcements = channels.filter(c => c.type === 'GUILD_NEWS').size;
            const stages = channels.filter(c => c.type === 'GUILD_STAGE_VOICE').size;
            const regularEmojis = guild.emojis.cache.filter(e => !e.animated).size;
            const animatedEmojis = guild.emojis.cache.filter(e => e.animated).size;
            const totalEmojis = guild.emojis.cache.size;
            const createdDate = guild.createdAt.toLocaleString();
            const verificationLevelStr = guild.verificationLevel.toString();
            const afkChannelName = guild.afkChannel ? guild.afkChannel.name : 'None';
            const afkTimeout = guild.afkTimeout / 60; // Convert seconds to minutes
            const systemChannelName = guild.systemChannel ? guild.systemChannel.name : 'None';

            // Prepare the embed
            const serverInfoEmbed = new MessageEmbed()
                .setColor(0x3498db)
                .setTitle(`Server Info for ${guild.name}`)
                .addFields(
                    { name: 'Owner', value: owner ? owner.user.tag : 'Unknown', inline: true },
                    { name: 'Region', value: guild.region || 'Unknown', inline: true },
                    { name: 'Created On', value: createdDate, inline: true },
                    { name: 'Members', value: `${memberCount}`, inline: true },
                    { name: 'Banned Members', value: `${bannedMembers}`, inline: true },
                    { name: 'Verification Level', value: verificationLevelStr, inline: true },
                    { name: 'Inactive Channel', value: afkChannelName, inline: true },
                    { name: 'Inactive Timeout', value: `${afkTimeout} minutes`, inline: true },
                    { name: 'System Messages Channel', value: systemChannelName, inline: true },
                    { name: 'Active Invites', value: `${activeInvites}`, inline: true },
                    { name: 'Vanity URL', value: vanityURL, inline: true },
                    { name: 'Boost Level', value: `${premiumTier}`, inline: true },
                    { name: 'Boost Count', value: `${premiumSubscriptionCount}`, inline: true },
                    { name: 'Server Features', value: features, inline: true },
                    { name: 'Channels', value: `Text Channels: ${textChannels}\nVoice Channels: ${voiceChannels}\nCategories: ${categories}\nAnnouncements: ${announcements}\nStages: ${stages}`, inline: true },
                    { name: 'Emojis', value: `Regular: ${regularEmojis}\nAnimated: ${animatedEmojis}\nTotal: ${totalEmojis}`, inline: true }
                )
                .setFooter(`Requested by ${message.author.tag}`)
                .setTimestamp();

            // Send the embed message
            message.reply({ embeds: [serverInfoEmbed] });

        } catch (error) {
            // Catch any errors that occur during the execution of the command
            logError('Error executing serverinfo command:', error);
            message.reply('There was an error trying to execute that command!');
        }
    },
};
