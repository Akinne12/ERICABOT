// guildMemberAdd.js
const { logger } = require('../../utils/logger');

module.exports = {
  name: 'guildMemberAdd',
  execute(member) {
    logger.info(`👋 ${member.user.tag} joined ${member.guild.name}`);
  }
};
