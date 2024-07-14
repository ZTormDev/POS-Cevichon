const express = require('express');
const app = express();
const path = require('path');
const orders = require('./db/orders');
const products = require('./db/products');
const sales = require('./db/sales');
const order_items = require('./db/order_items');
const users = require('./db/users');

const port = process.env.PORT || 3000;

app.use(express.json());

// Define la carpeta donde están tus archivos estáticos (como main.html)
app.use(express.static(path.join(__dirname, './')));

// Ruta principal para servir main.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, './main.html'));
});



//-----------------------------------------APIS------------------------------------------------------ 

// RUTA PARA OBTENER los usuarios
app.get('/users', (req, res) => {
    users.getUsers((err, users) => {
        if (err) return res.status(500).send(err.message);
        res.json(users);
    });
});

// RUTA PARA OBTENER DATOS DE UN PEDIDO
app.get('/order_items', (req, res) => {
    order_items.getOrderItems((err, orderItems) => {
        if (err) return res.status(500).send(err.message);
        res.json(orderItems);
    });
});

// RUTA PARA AGREGAR UN ITEM CART
app.post('/order_items', (req, res) => {
    const { order_id, cartProducts } = req.body;
    order_items.insertOrderItems(order_id, cartProducts, (err, data) => {
        if (err) return res.status(500).send(err.message);
        res.json(data);
    });
});


// RUTA PARA OBTENER DATOS DE TODOS LOS PEDIDOS
app.get('/orders', (req, res) => {
    orders.getOrders((err, data) => {
        if (err) return res.status(500).send(err.message);
        res.json(data);
    });
});

// RUTA PARA OBTENER DATOS DE UN PEDIDO
app.get('/orders/:order_id', (req, res) => {
    const order_id = req.params.order_id;
    orders.getOrder(order_id, (err, data) => {
        if (err) return res.status(500).send(err.message);
        res.json(data);
    });
});

// RUTA PARA AGREGAR UN PEDIDO
app.post('/orders', (req, res) => {
    const { client_name, client_number, client_address, order_time, order_date, order_total, order_status } = req.body;
    orders.addOrder(client_name, client_number, client_address, order_time, order_date, order_total, order_status, (err, data) => {
        if (err) return res.status(500).send(err.message);
        res.json(data);
    });
});


// Ruta para eliminar un PEDIDO específico
app.delete('/orders/:order_id', (req, res) => {
    const order_id = req.params.order_id;
    orders.deleteOrder(order_id, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});


// Ruta para actualizar un PEDIDO específico
app.put('/orders/:order_id', (req, res) => {
    const order_id = req.params.order_id;
    const { order_status } = req.body;

    orders.updateOrder(order_id, order_status, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});






// RUTA PARA OBTENER DATOS DE TODOS LOS PRODUCTOS
app.get('/products', (req, res) => {
    products.getProducts((err, data) => {
        if (err) return res.status(500).send(err.message);
        res.json(data);
    });
});


// RUTA PARA OBTENER DATOS DE UN PRODUCTO
app.get('/products/:id', (req, res) => {
    const productId = req.params.id;
    products.getProduct(productId, (err, data) => {
        if (err) return res.status(500).send(err.message);
        res.json(data);
    });
});

// RUTA PARA AGREGAR UN PRODUCTO
app.post('/products', (req, res) => {
    const { name, price, stock } = req.body;
    products.addProduct(name, price, stock, (err, data) => {
        if (err) return res.status(500).send(err.message);
        res.json(data);
    });
});

// Ruta para eliminar un producto específico
app.delete('/products/:id', (req, res) => {
    const productId = req.params.id;
    products.deleteProduct(productId, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// RUTA PARA VER TODAS LAS VENTAS
app.get('/sales', (req, res) => {
    sales.getSales((err, data) => {
        if (err) return res.status(500).send(err.message);
        res.json(data);
    });
});

// RUTA PARA AGREGAR UNA VENTA
app.post('/sales', (req, res) => {
    const { product_id, quantity } = req.body;
    sales.addSale(product_id, quantity, (err, data) => {
        if (err) return res.status(500).send(err.message);
        res.json(data);
    });
});


// Ruta para actualizar un producto específico
app.put('/products/:id', (req, res) => {
    const productId = req.params.id;
    const { price, stock } = req.body;

    products.updateProduct(productId, price, stock, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});


app.listen(port, () => {
    console.log(`Port running in http://localhost:${port}`);
});