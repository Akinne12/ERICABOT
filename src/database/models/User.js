// User.js
const connection = require('../connection');

const User = {
  create: (userId, username) => {
    const query = 'INSERT INTO users (userId, username) VALUES (?, ?) ON DUPLICATE KEY UPDATE username = ?';
    connection.query(query, [userId, username, username], (err) => {
      if (err) console.error('Error creating user:', err);
    });
  },

  getUser: (userId, callback) => {
    const query = 'SELECT * FROM users WHERE userId = ?';
    connection.query(query, [userId], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results[0]);
    });
  }
};

module.exports = User;