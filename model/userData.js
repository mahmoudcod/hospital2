// Updated user model (user.js)
const { app } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let db;

function initializeDatabase() {
  const dbPath = path.join(app.getAppPath(), './hospital.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      // Create your users table if it doesn't exist
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          password TEXT NOT NULL,
          isAdmin INTEGER DEFAULT 0 -- 0 for regular user, 1 for admin
        );
      `);
    }
  });
}

function addUser(username, password, isAdmin = 0) {
  db.run('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)', [username, password, isAdmin], (err) => {
    if (err) {
      console.error('Error inserting user:', err.message);
    } else {
      console.log('User added successfully');
    }
  });
}

function getUser(username, callback) {
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Error retrieving user:', err.message);
      callback(null);
    } else {
      callback(row);
    }
  });
}

module.exports = {
  initializeDatabase,
  addUser,
  getUser,
  db, // Export the database connection instance
};
