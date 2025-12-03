//alert('Javascript is working')
function validateForm() {
    let totalCost = 0;

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    //Name and email are mandatory
    if (!name || typeof name !== 'string' || !isNaN(name) || name == " ") {
        displayError("Name is mandatory and only string allowed");
    }
    if (!email) {
        displayError("Email is Mandatory");
    }
    //Validation for Credit Card details
    let creditCard = document.getElementById("creditCard").value.trim();
    let creditExpiryMonth = document.getElementById("creditExpiryMonth").value.trim();
    let creditExpiryYear = document.getElementById("creditExpiryYear").value.trim();

    let valiadateCC = /^\d{4}-\d{4}-\d{4}-\d{4}$/; //xxxx-xxxx-xxxx-xxxx
    let validateMonth = /^[A-Z]{3}$/;  //MMM
    let validateYear = /^\d{4}$/; //yyyy

    if (!valiadateCC.test(creditCard)) {
        displayError("Credit Card must be in format xxxx-xxxx-xxxx-xxxx");
    }
    if (!validateMonth.test(creditExpiryMonth)) {
        displayError("Expiry Month must be in MMM format");
    }
    if (!validateYear.test(creditExpiryYear)) {
        displayError("Expiry Year must be in yyyy format");
    }


    let productQuantity = [
        { id: "basketball", name: "Basketball", price: 15 },
        { id: "guitar", name: "Guitar", price: 30 },
        { id: "sunglasses", name: "Sunglasses", price: 8 },
        { id: "purse", name: "Purse", price: 5 },
        { id: "blender", name: "Blender", price: 25 }
    ];

    //Calculating totalCost of items purchased 
    let totalItems = 0;
    productQuantity.forEach(item => {
        let quantity = document.getElementById(item.id).value.trim();
        totalItems += quantity;
        totalCost += item.price * quantity;
        //alert(item.price);

    });

    //validating items as it shouldn't be 0,and numeric
    if (totalItems == 0) {
        displayError("At least one item must be bought");
        return false;
    }
    else if (isNaN(totalItems)) {
        displayError('Please enter a numeric value.');
        return false;
    }
    else {
        return { totalCost, productQuantity };
    }


    // alert(totalCost)
}

function displayError(message) {
    let errorsDiv = document.getElementById("errors");
    let errorParagraph = document.createElement("p");
    errorParagraph.textContent = message;
    errorParagraph.className = "error-message";
    errorsDiv.appendChild(errorParagraph);
}


//Receipt generation logic
function generateReceipt() {
    document.getElementById("errors").innerHTML = "";
    document.getElementById("receipt").innerHTML = "";

    let { totalCost, productQuantity } = validateForm();

    let errorsDiv = document.getElementById("errors");
    if (errorsDiv.children.length > 0) {
        return;
    }
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let creditCard = document.getElementById("creditCard").value.trim();
    //Donation logic -> if less than 100$ then 10$ will be applied , else 10% 
    let donation = Math.max(10, totalCost * 0.10);

    let receiptDiv = document.getElementById("receipt");
//Bill generated in table format
    let receiptHTML = `
      <h2>Thank you for your purchase!</h2>
        <table>
            <tr><th>Name</th><td>${name}</td></tr>
            <tr><th>Email</th><td>${email}</td></tr>
            <tr><th>Credit Card</th><td>xxxx-xxxx-xxxx-${creditCard.slice(-4)}</td></tr>
        </table>
       
        <table>
            <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Price</th>
            </tr>
            
    `;

    productQuantity.forEach(item => {
        let quantity = parseInt(document.getElementById(item.id).value.trim());
        if (quantity > 0) {
            receiptHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${(item.price * quantity).toFixed(2)}</td>
                </tr>
            `;
        }
    });

    receiptHTML += `
        <tr>
            <td>Donation</td>
            <td></td>
            <td>Minimum</td>
            <td>$${donation}</td>
        </tr>
        <tr>
            <td>Total</td>
            <td></td>
            <td></td>
            <td>$${(totalCost + donation).toFixed(2)}</td>
        </tr>
    </table>
    `;

    receiptDiv.innerHTML = receiptHTML;
    alert('Receipt generated')
}