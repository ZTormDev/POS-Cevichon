const db = require('./connection');

function getUsers(callback) {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            callback(err);
        }
        callback(null, rows);
    });
}

module.exports = { getUsers };
