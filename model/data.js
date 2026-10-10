// Import necessary modules
const { app } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');

// Initialize the database
let db;

function initializeDatabase() {
  const dbPath = path.join(app.getAppPath(), './hospital.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      createTrackingTable();
    }
  });
}

// Create the tracking table if it does not exist
function createTrackingTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      code,
      doctorName TEXT NOT NULL,
      patientName TEXT NOT NULL,
      operationType TEXT NOT NULL,
      operationTime TEXT NOT NULL,
      anesthesiaDoctor TEXT NOT NULL,
      nursing TEXT NOT NULL,
      ticketNumber TEXT NOT NULL,
      devices JSON NOT NULL,
      operationCategory TEXT NOT NULL,
      operationRoomNumber TEXT NOT NULL,
      username TEXT,
      cureType TEXT,  
      cureName TEXT,  
      userId INTEGER,
      quantty TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);
}


// Add tracking data to the database
async function addTrackingData(data, userId, cureType, cureName) {
  return new Promise((resolve, reject) => {
    const {
      date,
      code,
      doctorName,
      patientName,
      operationType,
      operationTime,
      anesthesiaDoctor,
      nursing,
      ticketNumber,
      devices,
      operationCategory,
      operationRoomNumber,
      username,
      quantty,
    } = data;

    const formattedDate = moment(date).format('MMMM DD, YYYY');

    const query = `
      INSERT INTO tracking (
        date,
        code,
        doctorName,
        patientName,
        operationType,
        operationTime,
        anesthesiaDoctor,
        nursing,
        ticketNumber,
        devices,
        operationCategory,
        operationRoomNumber,
        username,
        userId,
        cureType,
        cureName,
        quantty
      ) VALUES (?, ?, ?, ?, ?,?, ?, ?, ?,?, ?, ?, ?,?, ?, ?, ?)
    `;

    db.run(
      query,
      [
        formattedDate,
        JSON.stringify(code),
        doctorName,
        patientName,
        operationType,
        operationTime,
        anesthesiaDoctor,
        nursing,
        ticketNumber,
        JSON.stringify(devices),
        operationCategory,
        operationRoomNumber,
        username,
        userId,
        JSON.stringify(cureType),
        JSON.stringify(cureName),
        JSON.stringify(quantty),
      ],
      (err) => {
        if (err) {
          console.error('Error inserting tracking data:', err.message);
          reject(err.message);
        } else {
          resolve();
        }
      }
    );
  });
}
function getTrackingData() {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM tracking';

    db.all(query, (err, rows) => {
      if (err) {
        console.error('Error retrieving tracking data:', err.message);
        reject(err.message);
      } else {
        resolve(rows);
      }
    });
  });
}




async function updateTrackingData(id, newData) {
  return new Promise((resolve, reject) => {
    const {
      doctorName,
      patientName,
      operationType,
      operationTime,
      anesthesiaDoctor,
      nursing,
      ticketNumber,
      devices,
      operationCategory,
      operationRoomNumber,
        cureType,
        cureName,
        quantty,
        code
    } = newData;

const query = `
  UPDATE tracking
  SET
    doctorName = ?,
    patientName = ?,
    operationType = ?,
    operationTime = ?,
    anesthesiaDoctor = ?,
    nursing = ?,
    ticketNumber = ?,
    devices = ?,
    operationCategory = ?,
    operationRoomNumber = ?,
      cureType = ?,
        cureName = ?,
        quantty = ?,
        code = ?
  WHERE id = ?
`;

    db.run(
      query,
      [
        doctorName,
        patientName,
        operationType,
        operationTime,
        anesthesiaDoctor,
        nursing,
        ticketNumber,
 JSON.stringify(devices),
        operationCategory,
        operationRoomNumber,
           JSON.stringify(cureType),
        JSON.stringify(cureName),
        JSON.stringify(quantty),
         JSON.stringify(code),
        id
      ],
      (err) => {
        if (err) {
          console.error('Error updating tracking data:', err.message);
          reject(err.message);
        } else {
          resolve();
        }
      }
    );
  });
}




async function deleteTrackingData(id) {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM tracking WHERE id = ?';

    db.run(query, [id], (err) => {
      if (err) {
        console.error('Error deleting tracking data:', err.message);
        reject(err.message);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  initializeDatabase,
  createTrackingTable,
  addTrackingData,
  getTrackingData, 
  updateTrackingData,
  deleteTrackingData,
  db,
};
