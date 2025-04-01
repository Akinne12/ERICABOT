// ./utils/paginator.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Paginates an array of items across multiple embeds
 * @param {Object} options - Configuration options
 * @param {Interaction|Message} options.message - Discord message/interaction
 * @param {Array} options.items - Items to paginate
 * @param {Function} options.formatItem - Formats individual items
 * @param {String} options.title - Base embed title
 * @param {Number} [options.pageSize=10] - Items per page
 * @param {Number} [options.timeout=60000] - How long buttons stay active (ms)
 * @param {Number} [options.color=0x5865F2] - Embed color
 */
module.exports = async function paginate({
  message,
  items,
  formatItem,
  title,
  pageSize = 10,
  timeout = 60000,
  color = 0x5865F2
}) {
  if (!items.length) {
    return message.reply({ embeds: [
      new EmbedBuilder()
        .setTitle(title)
        .setDescription('*No items found*')
        .setColor(color)
    ] });
  }

  const totalPages = Math.ceil(items.length / pageSize);
  let currentPage = 0;

  // Format the current page
  const getPage = () => {
    const start = currentPage * pageSize;
    const pageItems = items.slice(start, start + pageSize);
    
    return new EmbedBuilder()
      .setTitle(`${title} (Page ${currentPage + 1}/${totalPages})`)
      .setDescription(pageItems.map(formatItem).join('\n') || '*No items*')
      .setColor(color)
      .setFooter({ text: `Total items: ${items.length}` });
  };

  // Create buttons
  const getButtons = () => {
    const row = new ActionRowBuilder();
    
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('paginate_first')
        .setEmoji('⏮️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 0),
      
      new ButtonBuilder()
        .setCustomId('paginate_prev')
        .setEmoji('◀️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 0),
      
      new ButtonBuilder()
        .setCustomId('paginate_next')
        .setEmoji('▶️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage >= totalPages - 1),
      
      new ButtonBuilder()
        .setCustomId('paginate_last')
        .setEmoji('⏭️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage >= totalPages - 1)
    );

    return row;
  };

  // Send initial message
  const reply = await message.reply({ 
    embeds: [getPage()], 
    components: [getButtons()] 
  });

  // Only listen for interactions from original user
  const collector = reply.createMessageComponentCollector({ 
    time: timeout 
  });

  collector.on('collect', async interaction => {
    if (interaction.user.id !== message.author.id) {
      return interaction.reply({ 
        content: '❌ These controls aren\'t for you', 
        ephemeral: true 
      });
    }

    switch (interaction.customId) {
      case 'paginate_first':
        currentPage = 0;
        break;
      case 'paginate_prev':
        currentPage = Math.max(0, currentPage - 1);
        break;
      case 'paginate_next':
        currentPage = Math.min(totalPages - 1, currentPage + 1);
        break;
      case 'paginate_last':
        currentPage = totalPages - 1;
        break;
    }

    await interaction.update({ 
      embeds: [getPage()], 
      components: [getButtons()] 
    });
  });

  collector.on('end', () => {
    reply.edit({ 
      components: [] 
    }).catch(() => {});
  });

  return reply;
};