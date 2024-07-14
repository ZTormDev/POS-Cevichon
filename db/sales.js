const db = require('./connection');

function getSales(callback) {
    db.all("SELECT * FROM sales", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            callback(err);
        }
        callback(null, rows);
    });
}

function addSale(product_id, quantity, callback) {
    db.get(`SELECT price FROM products WHERE id = ?`, [product_id], (err, product) => {
        if (err) {
            console.error(err.message);
            return callback(err);
        }
        const total_price = product.price * quantity;
        db.run(`INSERT INTO sales (product_id, quantity, total_price) VALUES (?, ?, ?)`, [product_id, quantity, total_price], function (err) {
            if (err) {
                console.error(err.message);
                return callback(err);
            }
            callback(null, { id: this.lastID });
        });
    });
}

module.exports = { getSales, addSale };
