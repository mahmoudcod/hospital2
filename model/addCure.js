// curefun.js
const { app } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let db;

function initializeDatabase(callback) {
  const dbPath = path.join(app.getAppPath(), './hospital.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      createCuresTable(() => {
        // Additional initialization logic, if any
        if (callback) callback(); // Call the callback function after initialization
      });
    }
  });
}

function createCuresTable(callback) {
  db.run(`
    CREATE TABLE IF NOT EXISTS cures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      stock,
      userId INTEGER,
      date TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `, function (err) {
    if (err) {
      console.error('Error creating cures table:', err.message);
      if (callback) callback(err);
    } else {
      if (callback) callback();
    }
  });
}

function addCure(name, type,stock, userId, date, callback) {
  const query = `
    INSERT INTO cures (name, type, stock, userId, date)
    VALUES (?, ?, ?, ?, ?);
  `;

  db.run(query, [name, type, stock, userId, date], function (err) {
    if (err) {
      console.error('Error adding cure:', err.message);
      if (callback) callback(err);
    } else {
      console.log('Cure added successfully');
      if (callback) callback(null, this.lastID); // Pass the last inserted ID to the callback
    }
  });
}


async function getAllCures() {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM cures';
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching cure data:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function editCure(cureId, name, type, stock, userId, date, callback) {
  const query = `
    UPDATE cures
    SET name = ?, type = ?, stock = ?, userId = ?, date = ?
    WHERE id = ?;
  `;

  db.run(query, [name, type, stock, userId, date, cureId], function (err) {
    if (err) {
      console.error('Error editing cure:', err.message);
      if (callback) callback(err);
    } else {
      console.log('Cure edited successfully');
      if (callback) callback(null, this.changes); // Pass the number of affected rows to the callback
    }
  });
}
function editCureQuantity(cureId, stock, callback) {
  const query = `
    UPDATE cures
    SET stock = ?
    WHERE id = ?;
  `;

  db.run(query, [stock, cureId], function (err) {
    if (err) {
      console.error('Error editing cure stock:', err.message);
      if (callback) callback(err);
    } else {
      console.log('Cure stock edited successfully');
      if (callback) callback(null, this.changes); // Pass the number of affected rows to the callback
    }
  });
}

function deleteCure(cureId, callback) {
  const query = 'DELETE FROM cures WHERE id = ?';

  db.run(query, [cureId], function (err) {
    if (err) {
      console.error('Error deleting cure:', err.message);
      if (callback) callback(err);
    } else {
      console.log('Cure deleted successfully');
      if (callback) callback(null, this.changes); // Pass the number of affected rows to the callback
    }
  });
}



module.exports = {
  initializeDatabase,
  createCuresTable,
  addCure,
  getAllCures,
  deleteCure,
  editCure,
  editCureQuantity,
  db,
};
