module.exports = {
  hasPermission: (member, permissionFlags) => {
    if (!member?.permissions?.has) return false;
    return member.permissions.has(permissionFlags);
  },

  isBotOwner: (userId) => {
    return userId === process.env.BOT_OWNER_ID;
  },

  isTrustedUser: (userId) => {
    const trustedUsers = process.env.TRUSTED_USERS?.split(',') || [];
    return trustedUsers.includes(userId);
  },

  isBlacklisted: (userId) => {
    const blacklist = process.env.BLACKLISTED_USERS?.split(',') || [];
    return blacklist.includes(userId);
  }
};