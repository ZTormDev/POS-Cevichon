const db = require('./connection');

// OBTENER TODOS LOS PEDIDOS
function getOrders(callback) {
    db.all("SELECT * FROM orders", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return callback(err);
        }
        callback(null, rows);
    });
}

// OBTENER UN PEDIDO ESPECÍFICO
function getOrder(order_id, callback) {
    db.get(`SELECT * FROM orders WHERE order_id = ?`, [order_id], (err, row) => {
        if (err) {
            console.error(err.message);
            return callback(err);
        }
        callback(null, row);
    });
}

// AÑADIR UN PEDIDO
function addOrder(client_name, client_number, client_address, order_time, order_date, order_total, order_status, callback) {
    db.run(`INSERT INTO orders (client_name, client_number, client_address, order_time, order_date, order_total, order_status) VALUES (?, ?, ?, ?, ?, ?, ?)`, [client_name, client_number, client_address, order_time, order_date, order_total, order_status], function (err) {
        if (err) {
            console.error(err.message);
            return callback(err);
        }
        callback(null, { order_id: this.lastID });
    });
}

// BORRAR UN PEDIDO
function deleteOrder(order_id, callback) {
    db.run(`DELETE FROM orders WHERE order_id = ?`, [order_id], function (err) {
        if (err) {
            console.error(err.message);
            return callback(err);
        }
        callback(null, { success: true });
    });
}

// ACTUALIZAR UN PEDIDO
function updateOrder(order_id, order_status, callback) {
    db.run(`UPDATE orders SET order_status = ? WHERE order_id = ?`, [order_status, order_id], function (err) {
        if (err) {
            console.error(err.message);
            return callback(err);
        }
        callback(null, { success: true });
    });
}

module.exports = { getOrders, getOrder, addOrder, deleteOrder, updateOrder };
