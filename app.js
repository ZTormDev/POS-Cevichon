
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadSales();
    loadOrders();
});

let isActive;
const addManuallyButton = document.getElementById('add-product-button');
const buttonColor = addManuallyButton.style.backgroundColor;
const itemsContainer = document.getElementById('products-catalog');

function applyDiscount() {
    const discountInput = document.getElementById('discount-input');
    const discountPercentage = parseFloat(discountInput.value);

    if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
        alert('Por favor ingrese un descuento válido entre 0 y 100%.');
        discountInput.value = ''; // Limpiar el campo si el valor no es válido
        return;
    }

    updateTotal(discountPercentage);
}




function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = section.id === sectionId ? 'flex' : 'none';
    });

    new Audio('./sfx/clicksound.mp3').play();

    if (isActive) {
        isActive = false;
        addManuallyButton.innerHTML = 'Añadir Manualmente';
        itemsContainer.style.display = 'none';
        addManuallyButton.style.backgroundColor = buttonColor;
    }
}

function deleteProduct(productId) {
    if (!confirm("¿Estás seguro de querer borrar este producto?")) {
        return;
    }
    fetch(`/products/${productId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadProducts();
        } else {
            console.error('Error deleting product:', data.error);
        }
    })
    .catch(err => console.error('Error deleting product:', err));
}

function loadProducts() {
    fetch('/products')
    .then(response => response.json())
    .then(data => {
        const productsList = document.getElementById('products');
        productsList.innerHTML = '';

        if (data.length === 0) {
            productsList.innerHTML = '<p class="error-productos">No hay productos añadidos.</p>';
        } else {
            data.forEach(product => {
                const li = document.createElement('li');
                li.setAttribute('class', `${product.id}`);
                li.innerHTML = `
                    <p class="product-id">${product.id}</p>
                    <p class="product-name">${product.name}</p>
                    <p class="product-price"><span class="product-price-value">$${formatNumber(product.price)}</span></p>
                    <input type="number" class="product-price-edit" style="display:none;" value="${product.price}">
                    <p class="product-stock"><span class="product-stock-value">${formatNumber(product.stock)}</span></p>
                    <input type="number" class="product-stock-edit" style="display:none;" value="${product.stock}">
                    <button class="edit-button" onclick="toggleEdit(${product.id})">Editar</button>
                    <button class="save-button" style="display:none;" onclick="saveChanges(${product.id})">Guardar</button>
                    <button class="cancel-button" style="display:none;" onclick="toggleEdit(${product.id}, true)">Cancelar</button>
                    <button class="delete-button" onclick="deleteProduct(${product.id})">Borrar</button>
                `;
                productsList.appendChild(li);
            });
        }
    })
    .catch(err => console.error('Error loading products:', err));
}

function addProduct() {
    const name = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    const stock = document.getElementById('product-stock').value;

    if (name && price && stock != '')
    {
        fetch('/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, price, stock })
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                loadProducts();
                document.getElementById('product-name').value = '';
                document.getElementById('product-price').value = '';
                document.getElementById('product-stock').value = '';
            }
        })
        .catch(err => console.error('Error adding product:', err));
    }
}

function loadOrders() {
    fetch('/orders')
    .then(response => response.json())
    .then(data => {
        // Ordenar las órdenes por order_id de mayor a menor
        data.sort((a, b) => b.order_id - a.order_id);

        const ordersList = document.querySelector('.registro-pedidos-container');
        
        ordersList.innerHTML = '';

        data.forEach(order => {

            const li = document.createElement('li');
            li.innerHTML = `
                <p>${order.order_id}</p>
                <p>${order.client_name}</p>
                <p class="order-address-text">${order.client_address}</p>
                <p>${order.order_date} ${order.order_time}</p>
                <p class="order-total-text">$${formatNumber(order.order_total)}</p>
                <p id="status-text" class="status-text">${order.order_status} <a id="dotstatus-${order.order_id}" class="dotstatus">•</a></p>
            `;

            // Agregar evento de clic al <li> para abrir detalles del pedido
            li.addEventListener('click', () => openOrderDetails(order.order_id));

            ordersList.appendChild(li);
        });

        updateOrderDotStatus(); // Actualizar el estado de los puntos después de cargar las órdenes
    })
    .catch(err => console.error('Error loading orders:', err));
}



function loadSales() {
    fetch('/sales')
    .then(response => response.json())
    .then(data => {
        const salesList = document.getElementById('sales');
        salesList.innerHTML = '';
        data.forEach(sale => {
            const li = document.createElement('li');
            li.textContent = `Sale ID: ${sale.id} - Product ID: ${sale.product_id} - Quantity: ${formatNumber(sale.quantity)} - Total: $${formatNumber(sale.total_price)} - Date: ${sale.sale_date}`;
            salesList.appendChild(li);
        });
    })
    .catch(err => console.error('Error loading sales:', err));
}

function processSale() {
    const product_id = document.getElementById('sale-product-id').value;
    const quantity = document.getElementById('sale-quantity').value;

    fetch('/sales', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id, quantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            loadSales();
            document.getElementById('sale-product-id').value = '';
            document.getElementById('sale-quantity').value = '';
        }
    })
    .catch(err => console.error('Error processing sale:', err));
}

function toggleEdit(productId, cancel = false) {
    const priceValue = document.querySelector(`#products li[class="${productId}"] .product-price`);
    const priceEdit = document.querySelector(`#products li[class="${productId}"] .product-price-edit`);
    const stockValue = document.querySelector(`#products li[class="${productId}"] .product-stock`);
    const stockEdit = document.querySelector(`#products li[class="${productId}"] .product-stock-edit`);
    const editButton = document.querySelector(`#products li[class="${productId}"] .edit-button`);
    const saveButton = document.querySelector(`#products li[class="${productId}"] .save-button`);
    const cancelButton = document.querySelector(`#products li[class="${productId}"] .cancel-button`);
    const deleteButton = document.querySelector(`#products li[class="${productId}"] .delete-button`);

    fetch(`/products/${productId}`)
    .then(response => response.json())
    .then(data => {
        priceEdit.value = data.price;
        stockEdit.value = data.stock;
    });

    if (cancel) {
        priceEdit.style.display = 'none';
        priceValue.style.display = 'inline';
        stockEdit.style.display = 'none';
        stockValue.style.display = 'inline';
        editButton.style.display = 'inline';
        deleteButton.style.display = 'inline';
        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';
    } else {
        priceEdit.style.display = 'inline';
        priceValue.style.display = 'none';
        stockEdit.style.display = 'inline';
        stockValue.style.display = 'none';
        editButton.style.display = 'none';
        deleteButton.style.display = 'none';
        saveButton.style.display = 'inline';
        cancelButton.style.display = 'inline';
    }
}

function saveChanges(productId) {
    const newPrice = document.querySelector(`#products li[class="${productId}"] .product-price-edit`).value;
    const newStock = document.querySelector(`#products li[class="${productId}"] .product-stock-edit`).value;

    fetch(`/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ price: newPrice, stock: newStock })
    })
    .then(response => {
        if (response.ok) {
            loadProducts(); // Recargar la lista de productos después de guardar los cambios
        } else {
            throw new Error('Failed to save changes');
        }
    })
    .catch(err => console.error('Error saving changes:', err));
}

function browseProducts() {
    isActive = !isActive;

    if (isActive) {
        addManuallyButton.innerHTML = 'Cancelar';
        addManuallyButton.style.backgroundColor = 'rgba(255, 81, 46, 80%)';
        itemsContainer.style.display = 'flex';

        fetch('/products')
        .then(response => response.json())
        .then(data => {
            itemsContainer.innerHTML = '<h3>Tus Productos</h3> <li class="class-list"><p class="product-id">ID</p><p>Nombre</p><p>Precio</p><p>Stock</p><p>Cantidad</p><p>Total</p></li>';

            if (data.length === 0) {
                itemsContainer.innerHTML = '<p class="error-productos">No hay productos añadidos.</p>';
            } else {
                data.forEach(product => {
                    const li = document.createElement('li');
                    li.classList.add(`${product.id}`);
                    li.classList.add('item-on-products');
                    
                    li.innerHTML = `
                        <p class="product-id">${product.id}</p>
                        <p class="product-name">${product.name}</p>
                        <p class="product-price">$${formatNumber(product.price)}</span></p>
                        <p class="product-stock">${formatNumber(product.stock)}</span></p>
                        <input type="number" class="product-quantity" id="product-quantity-${product.id}-input" value="1" min="1" onchange="actualizarCantidad(${product.id}, ${product.price})">
                        <p class="product-total">$${formatNumber(product.price)}</p>
                        <button id="add-tocart" onclick='addToCart(${product.id})'>Añadir</button>
                    `;
                    itemsContainer.appendChild(li);
                });
            }
        })
        .catch(err => console.error('Error loading products:', err));
    } else {
        addManuallyButton.innerHTML = 'Añadir Manualmente';
        itemsContainer.style.display = 'none';
        addManuallyButton.style.backgroundColor = buttonColor;
    }
}


function actualizarCantidad(productId, productPrice) {
    const quantityInput = document.getElementById(`product-quantity-${productId}-input`);
    const quantity = quantityInput.value;
    quantityInput.setAttribute('data-quantity', quantity);

    const totalProduct = document.querySelector(`#products-catalog li[class='${productId}'] p[class='product-total']`);
    const totalPrice = productPrice * quantity;
    totalProduct.innerHTML = `$${formatNumber(totalPrice)}`;
    updateTotal();
}

function addToCart(productId) {
    const itemsBoxContainer = document.querySelector('.items-box-container');
    const noProducts = document.querySelector('#no-products');
    const existingProduct = document.getElementById(`cart-item-${productId}`);

    const quantityInput = document.getElementById(`product-quantity-${productId}-input`);
    const selectedQuantity = quantityInput.getAttribute('data-quantity') || quantityInput.value;

    console.log(productId);
    console.log(existingProduct);

    if (existingProduct) {
        const currentQuantityInput = existingProduct.querySelector('.product-quantity');
        const newQuantity = parseInt(currentQuantityInput.value) + parseInt(selectedQuantity);
        currentQuantityInput.value = newQuantity;
        totalPriceCalc(productId, parseFloat(existingProduct.querySelector('.product-price').textContent.slice(1).replace(/,/g, '')), newQuantity);
    } else {
        fetch(`/products/${productId}`)
        .then(response => response.json())
        .then(data => {

            noProducts.style.display = 'none';
            const li = document.createElement('li');
            li.setAttribute("id", `cart-item-${productId}`);
            li.classList.add(`${data.id}`);
            li.classList.add('item-on-cart');
            li.innerHTML = `
                <p class="product-id">${data.id}</p>
                <p class="product-name">${data.name}</p>
                <p class="product-price">$${formatNumber(data.price)}</p>
                <input type="number" class="product-quantity" id="product-quantity-${data.id}" value="${selectedQuantity}" min="1" onchange="totalPriceCalc(${data.id}, ${data.price}, this.value)">
                <p id="total-${data.id}" class="product-total">$${formatNumber(data.price * selectedQuantity)}</p>
                <button id="delete-product-cart" onclick='deleteOnCart(${data.id})'>Eliminar</button>
            `;
            itemsBoxContainer.appendChild(li);
            updateTotal();
            mostarCompleteButton()
        });
    }

    
}

function totalPriceCalc(productId, productPrice, productQuantity) {
    const totalProduct = document.querySelector(`#total-${productId}`);
    const totalPrice = productPrice * productQuantity;
    totalProduct.innerHTML = `$${formatNumber(totalPrice)}`;
    updateTotal();
}

function deleteOnCart(itemID) {
    const itemOnCart = document.querySelector(`.items-box-container li[class="${itemID} item-on-cart"]`);
    itemOnCart.remove();

    const itemsBoxContainer = document.querySelector('.items-box-container');
    const noProducts = document.querySelector('#no-products');

    if (itemsBoxContainer.children.length === 2) {
        noProducts.style.display = 'flex';
    }

    updateTotal();
    mostarCompleteButton()
}

function formatNumber(number) {
    var parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}


function updateTotal(discountPercentage) {
    const itemsContainer = document.querySelector('.items-box-container');
    const items = itemsContainer.querySelectorAll('li');

    let total = 0;
    items.forEach(item => {
        const totalPriceElement = item.querySelector('.product-total');
        if (totalPriceElement) {
            const totalPriceText = totalPriceElement.textContent.replace('$', '').replace(/,/g, ''); // Remover el símbolo de dólar y las comas
            total += parseFloat(totalPriceText);
        }
    });

    if (discountPercentage > 0) {
        const discountFactor = 1 - (discountPercentage / 100);
        total *= discountFactor;
        total = Math.round(total);
    }

    const totalCartElement = document.getElementById('total-cart');
    if (totalCartElement) {
        totalCartElement.textContent = `$${formatNumber(total)}`;
    }
}


function selectLocation() {
    const envioDomicilioInput = document.getElementById('direccion1');
    const retiroLocalInput = document.getElementById('direccion2');
    const direccionContainer = document.querySelector('.direccion-container');
    const direccionClienteInput = document.getElementById('direccion-cliente');

    if (envioDomicilioInput.checked) {
        direccionContainer.classList.remove('hidden');
    } else {
        direccionClienteInput.value = '';
        direccionContainer.classList.add('hidden');
    }
}


function mostarCompleteButton() {
    const envioDomicilioInput = document.getElementById('direccion1').checked;
    const retiroLocalInput = document.getElementById('direccion2').checked;
    const nombreClienteInput = document.getElementById('nombre-cliente').value;
    const numeroClienteInput = document.getElementById('numero-cliente').value;
    const direccionClienteInput = document.getElementById('direccion-cliente').value;
    const completeButton = document.getElementById('complete-button');
    const itemsBoxContainer = document.querySelector('.items-box-container');


    if (itemsBoxContainer.children.length > 2) {
        if (nombreClienteInput != '') {
            if(numeroClienteInput != '') {
                if (envioDomicilioInput) {
                    if (direccionClienteInput != ''){
                        completeButton.classList.remove('hidden');
                    }
                    else {
                        completeButton.classList.add('hidden');
                    }
                }
                if (retiroLocalInput) {
                    completeButton.classList.remove('hidden');
                }
            }
            else {
                completeButton.classList.add('hidden');
            }
        }
        else {
            completeButton.classList.add('hidden');
        }
    }
    else {
        completeButton.classList.add('hidden');
    }
}


function completeOrder() {
    const client_name = document.getElementById('nombre-cliente').value;
    const client_number = document.getElementById('numero-cliente').value;
    const client_address = document.getElementById('direccion-cliente').value;
    const totalCarrito = document.getElementById('total-cart').innerText;
    const envioDomicilio = document.querySelector('#direccion1').checked;
    const itemsInCart = document.querySelectorAll('.item-on-cart');

    let order_total = totalCarrito.replace(/[^0-9]/g, '');
    let orderID;
    const currentDate = new Date();
    const formattedLocalDate = currentDate.toLocaleString();
    const [date, time] = formattedLocalDate.split(', ');
    const [hours, minutes] = time.split(':');
    const formattedTime = `${hours}:${minutes}`;

    let address;
    let status = 'Completado';

    if (envioDomicilio) {
        address = client_address;
        status = 'Pendiente';
    } else {
        address = 'Retiro Local';
    }

    fetch('/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ client_name, client_number, client_address: address, order_time: formattedTime, order_date: date, order_total, order_status: status })
    })
    .then(response => response.json())
    .then(data => {
        orderID = data.order_id;

        // Construir el array de cartProducts
        let cartProducts = [];
        itemsInCart.forEach(item => {
            let product = {
                product_id: parseInt(item.querySelector('.product-id').textContent),
                product_name: item.querySelector('.product-name').textContent,
                product_price: parseFloat(item.querySelector('.product-price').textContent.slice(1).replace(/,/g, '')),
                product_quantity: parseInt(item.querySelector('.product-quantity').value),
                product_total: parseFloat(item.querySelector('.product-total').textContent.slice(1).replace(/,/g, ''))
            };
            cartProducts.push(product);
        });
        

        console.log(cartProducts);
        // Llamar a la función insertOrderItems con el array cartProducts
        fetch('/order_items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ order_id: orderID, cartProducts })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Orden enviada correctamente");
        })
        .catch(err => console.error('Error adding order:', err));

        // Restablecer campos y elementos visuales después de completar la orden
        document.getElementById('nombre-cliente').value = '';
        document.getElementById('numero-cliente').value = '';
        document.getElementById('direccion-cliente').value = '';
        document.querySelector('#direccion1').checked = false;
        document.querySelector('#direccion2').checked = false;

        document.getElementById('total-cart').innerText = '$0';
        itemsInCart.forEach(item => item.remove());
        document.getElementById('complete-button').classList.add('hidden');
        document.getElementById('no-products').classList.remove('hidden');
        document.getElementById('no-products').style.display = 'flex';

        if (isActive) {
            isActive = false;
            addManuallyButton.innerHTML = 'Añadir Manualmente';
            itemsContainer.style.display = 'none';
            addManuallyButton.style.backgroundColor = buttonColor;
        }

        new Audio('./sfx/clicksound.mp3').play();
    })
    .catch(err => console.error('Error adding order:', err));
}



function updateOrderDotStatus() {
    const dots = document.querySelectorAll('.dotstatus');
    const statusTexts = document.querySelectorAll('.status-text');

    statusTexts.forEach((text, index) => {
        if (text.textContent.trim() === 'Completado •') {
            dots[index].style.color = 'rgba(69, 255, 97, 1)';
        } else {

        }
    });
}


function openOrderDetails(orderID) {
    const parentOrder = document.querySelector('.order-details-bg')

    fetch(`/orders/${orderID}`)
    .then(response => response.json())
    .then(data => {
        const orderDetails = document.createElement('div');
        orderDetails.classList.add('order-details-container');

        orderDetails.innerHTML = `
        <div class="order-details-container">
            <div class="details-order-container">
                <div class="information-order-container">
                    <h2>Detalles del Pedido</h2>
                    <div class="items-client-container">
                        <li>
                            <p>Nombre</p>
                            <p>Cantidad</p>
                            <p>Total</p>
                        </li>
                    </div>
                    <div class="info-details-order">
                        <div>
                            <p>Total del Pedido: </p><p>$${formatNumber(data.order_total)}</p>
                        </div>
                        <div>
                            <p>Nombre del cliente: </p><p>${data.client_name}</p>
                        </div>
                        <div>
                            <p>Numero del cliente: </p><p>${data.client_number}</p>
                        </div>
                        <div>
                            <p>Direccion del cliente: </p><p>${data.client_address}</p>
                        </div>
                    </div>
                </div>

                <div class="buttons-order-container">
                    <div class="top-buttons">
                        <button id="map-button-${data.order_id}" class="map-button" onclick="searchLocation(${data.order_id})">Ver en el Mapa</button>
                        <button id="make-call-button" onclick="makeCall(${data.client_number})">Llamar</button>
                    </div>

                    <div class="bottom-buttons">
                        <button id="complete-order-button" onclick="completePendingOrders(${data.order_id})">Pedido Completado</button>
                        <button id="delete-order-button" onclick="deleteOrder(${data.order_id})">Borrar Pedido</button>
                    </div>
                    <button id="close-orderdetails-button" onclick="closeOrderPreview()">Cerrar</button>
                </div>
            </div>
        </div>
        `;

        parentOrder.appendChild(orderDetails);


        



        if(data.client_address == 'Retiro Local'){
            const mapButton = document.querySelector(`#map-button-${data.order_id}`);
            mapButton.classList.add('hidden');
        }

        if(data.order_status == 'Completado'){
            const buttons = document.querySelector(`.bottom-buttons`);
            buttons.remove();
        }

        fetch(`/order_items`)
        .then(response => response.json())
        .then(orderItems => {

            const itemsClientContainer = document.querySelector('.items-client-container');
            orderItems.forEach(item => {
                if(item.order_id == data.order_id){
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <p>${item.product_name}</p>
                        <p>${formatNumber(item.product_quantity)}</p>
                        <p>$${formatNumber(item.product_total)}</p>
                    `;
                    itemsClientContainer.appendChild(li);
                }
                
            });
        });

    });
}


function searchLocation(orderID) {
    fetch(`/orders/${orderID}`)
    .then(response => response.json())
    .then(data => {
        var location = data.client_address;
        var url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(location);
        window.open(url, "_blank");
    });
}

function makeCall(clientNumber) {
    var url = "tel:" + clientNumber;
    window.location.href = url;
}

function completePendingOrders(orderID) {
    const newStatus = 'Completado';

    if (!confirm("¿Estás seguro de confirmar el pedido?")) {
        return;
    }
    fetch(`/orders/${orderID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_id: orderID, order_status: newStatus })
    })
    .then(response => {
        const pedidosContainer = document.querySelector('.registro-pedidos-container');
        pedidosContainer.innerHTML = ``;
        loadProducts();
        closeOrderPreview();
    })
    .catch(err => console.error('Error saving changes:', err));
    loadOrders();
}

function deleteOrder(orderID) {
    if (!confirm("¿Estás seguro de eliminar el pedido?")) {
        return;
    }
    fetch(`/orders/${orderID}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        loadOrders();
        closeOrderPreview();
    })
    .catch(err => console.error('Error confirmating order:', err));
    loadOrders();
}   

function closeOrderPreview() {
    const orderDetailsContainer = document.querySelector('.order-details-container');
    orderDetailsContainer.remove();
    loadOrders();
}


function refreshOrders() {
    const pedidosContainer = document.querySelector('.registro-pedidos-container');
    pedidosContainer.innerHTML = ``;
    loadOrders();
}