let order = [];
// Add to Cart Function added

function addToCart(productName, productPrice) {

    let amount = prompt(`Enter number of ${productName} you want:`);

    // Validation added for product amount should be numeric only and not empty
    if (amount === null || amount === '' || amount <= 0) {
        alert('Oops your cart is empty, Please select an item');
        return ;
    }

    if (isNaN(amount)) {
        alert('Please enter a product quantity in numeric value');
        return ;
    }
   
    //Checkout button will appear only when item is added to cart
    document.getElementById('checkoutButton').style.display = 'block';

    amount = parseInt(amount);
    let product = order.find(item => item.name === productName);

    if (product) {
        product.amount += amount;
    } else {
        order.push({ name: productName, price: productPrice, amount: amount });
    }
}

function checkout() {
    let customerName = prompt('Please enter your name');

    if (!customerName || customerName == 0) { 
        alert("We need your name to proceed");
        return;
    }

    generateReceipt(customerName);
}

//Receipt generation function 
function generateReceipt(customerName) {
    let receiptContent = document.getElementById('receipt');
    receiptContent.innerHTML = '';
    let header = document.createElement('h1');
    header.textContent = 'Receipt';
    receiptContent.appendChild(header);

    let totalCost = 0;

// customer name 
    let customerInfo = document.createElement('p');
    customerInfo.textContent = `Customer Name: ${customerName}`;
    receiptContent.appendChild(customerInfo);

//item price
    order.forEach(product => {
        let productTotal = product.price * product.amount;
        totalCost += productTotal;

        let productInfo = document.createElement('p');
        productInfo.textContent = `${product.name}  x${product.amount}, $${productTotal.toFixed(2)}`;
        receiptContent.appendChild(productInfo);
    });
//Gst logic 
    let gst = totalCost * 0.13;
    let finalTotal = totalCost + gst;

    let gstInfo = document.createElement('p');
    gstInfo.textContent = `GST (13%): $${gst.toFixed(2)}`;
    receiptContent.appendChild(gstInfo);

//Total amount
    let totalInfo = document.createElement('p');
    totalInfo.textContent = `Total Cost: $${finalTotal.toFixed(2)}`;
    receiptContent.appendChild(totalInfo);

    document.getElementById('receipt').style.display = 'block';
}
