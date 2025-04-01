// Guild.js
const connection = require('../connection');

const Guild = {
  create: (guildId, guildName) => {
    const query = 'INSERT INTO guilds (guildId, guildName) VALUES (?, ?) ON DUPLICATE KEY UPDATE guildName = ?';
    connection.query(query, [guildId, guildName, guildName], (err) => {
      if (err) console.error('Error creating guild:', err);
    });
  },

  getGuild: (guildId, callback) => {
    const query = 'SELECT * FROM guilds WHERE guildId = ?';
    connection.query(query, [guildId], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results[0]);
    });
  }
};

module.exports = Guild;