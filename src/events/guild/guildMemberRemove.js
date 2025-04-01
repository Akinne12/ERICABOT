// guildMemberRemove.js
const { logger } = require('../../utils/logger');

module.exports = {
  name: 'guildMemberRemove',
  execute(member) {
    logger.info(`👋 ${member.user.tag} left ${member.guild.name}`);
  }
};
