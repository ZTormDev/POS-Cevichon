const db = require('./connection');

function getProducts(callback) {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            callback(err);
        }
        callback(null, rows);
    });
}

//CONSEGUIR INFO DEL PRODUCTO
function getProduct(id, callback) {
    db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, row) => {
        if (err) {
            console.error(err.message);
            callback(err);
        }
        callback(null, row);
    });
}

function addProduct(name, price, stock, callback) {
    db.run(`INSERT INTO products (name, price, stock) VALUES (?, ?, ?)`, [name, price, stock], function (err) {
        if (err) {
            console.error(err.message);
            callback(err);
        }
        callback(null, { id: this.lastID });
    });
}

function deleteProduct(id, callback) {
    db.run(`DELETE FROM products WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error(err.message);
            callback(err);
        }
        callback(null, { success: true });
    });
}



// Método `updateProduct` en tu módulo de productos (db/products.js)

function updateProduct(id, price, stock, callback) {
    db.run(`UPDATE products SET price = ?, stock = ? WHERE id = ?`, [price, stock, id], function (err) {
        if (err) {
            console.error(err.message);
            return callback(err);
        }
        callback(null, { success: true });
    });
}

module.exports = { getProducts, getProduct, addProduct, deleteProduct, updateProduct };