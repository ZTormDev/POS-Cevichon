const sqlite3 = require('sqlite3').verbose();
const dbPath = './database/pos_system.db';
let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

module.exports = db;
