const db = require('./connection');

function insertOrderItems(order_id, cartProducts) {
    const stmt = db.prepare(`INSERT INTO order_items (order_id, product_id, product_name, product_price, product_quantity, product_total) VALUES (?, ?, ?, ?, ?, ?)`);
    
    cartProducts.forEach(product => {
        stmt.run(order_id, product.product_id, product.product_name, product.product_price, product.product_quantity, product.product_total);
    });
}


// OBTENER un items de pedidos
function getOrderItems(callback) {
    db.all("SELECT * FROM order_items", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return callback(err);
        }
        callback(null, rows);
    });
}
module.exports = { insertOrderItems, getOrderItems };
