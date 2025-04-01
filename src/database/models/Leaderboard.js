// Leaderboard.js
const connection = require('../connection');

const Leaderboard = {
  getTopUsersByMessages: (limit, callback) => {
    const query = 'SELECT userId, messageCount FROM users ORDER BY messageCount DESC LIMIT ?';
    connection.query(query, [limit], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },

  getTopUsersByVoice: (limit, callback) => {
    const query = 'SELECT userId, voiceTime FROM users ORDER BY voiceTime DESC LIMIT ?';
    connection.query(query, [limit], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  }
};

module.exports = Leaderboard;
