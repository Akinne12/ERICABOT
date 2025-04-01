// permissionsCheck.js

module.exports = {
    hasPermission: (member, permissions) => {
      if (!member || !permissions) return false;
      return member.permissions.has(permissions);
    },
  
    isBotOwner: (userId, ownerId) => {
      return userId === ownerId;
    },
  
    isTrustedUser: (userId, trustedUsers) => {
      return trustedUsers.includes(userId);
    },
  
    isBlacklisted: (userId, blacklist) => {
      return blacklist.includes(userId);
    }
  };
  