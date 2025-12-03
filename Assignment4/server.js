const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/SportsSphereDB');

// Order schema and model
const orderSchema = new mongoose.Schema({
    name: String,
    address: String,
    city: String,
    province: String,
    phone: String,
    email: String,
    racket: Number,
    basketball: Number,
    bat: Number,
    subtotal: Number,
    taxRate: Number,
    taxAmount: Number,
    total: Number
});

const Order = mongoose.model('Order', orderSchema);

// Product prices
const products = {
    racket: 15,
    basketball: 8,
    bat: 20
};

// Tax rates for each province
const taxRates = {
    AB: 0.05,
    BC: 0.12,
    MB: 0.12,
    NB: 0.15,
    NL: 0.15,
    NT: 0.05,
    NS: 0.15,
    NU: 0.05,
    ON: 0.13,
    PE: 0.15,
    QC: 0.14975,
    SK: 0.11,
    YT: 0.05
};

// Routes
app.get('/', (req, res) => {
    res.render('index', { errors: [], data: {} });
});

// Validation and order processing
app.post('/submit', [
    body('name').trim().notEmpty().withMessage('Name is required')
        .isString().withMessage('Name should be string.')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name must contain only letters'),
    body('address').trim().notEmpty().withMessage('Address is required')
        .isString().withMessage('Address should be string.'),
    body('city').trim().notEmpty().withMessage('City is required')
        .isString().withMessage('City must be a string.')
        .matches(/^[a-zA-Z\s]+$/).withMessage('City must contain only letters'),
    body('province').notEmpty().withMessage('Province is required'),
    body('phone').trim().matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits.'),
    body('email').trim().isEmail().withMessage('Email must be valid.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('index', { errors: errors.array(), data: req.body });
    }

    console.log("Form Data:", req.body); // Log form data

    // Calculate total amount
    const orderDetails = ['racket', 'basketball', 'bat'].map(item => ({
        name: item,
        quantity: parseInt(req.body[item]) || 0,
        price: products[item],
        total: (parseInt(req.body[item]) || 0) * products[item]
    })).filter(item => item.quantity > 0);

    console.log("Order Details:", orderDetails); // Log order details

    const subtotal = orderDetails.reduce((sum, item) => sum + item.total, 0);

    // Checking minimum amount should not be less than $10
    if (subtotal < 10) {
        return res.render('index', { 
            errors: [{ msg: 'Minimum purchase amount is $10.' }],
            data: req.body 
        });
    }

    // Calculating tax based on selected province
    const selectedProvince = req.body.province;
    const taxRate = taxRates[selectedProvince];
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Saving the order to MongoDB
    const order = new Order({
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        province: selectedProvince,
        phone: req.body.phone,
        email: req.body.email,
        racket: parseInt(req.body.racket) || 0,
        basketball: parseInt(req.body.basketball) || 0,
        bat: parseInt(req.body.bat) || 0,
        subtotal: subtotal.toFixed(2),
        taxRate: (taxRate * 100).toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        total: total.toFixed(2)
    });

    try {
        await order.save();
        console.log('Order saved successfully');
        res.render('receipt', {
            name: req.body.name,
            address: req.body.address,
            city: req.body.city,
            province: selectedProvince,
            phone: req.body.phone,
            email: req.body.email,
            orderDetails,
            subtotal: subtotal.toFixed(2),
            taxRate: (taxRate * 100).toFixed(2),
            taxAmount: taxAmount.toFixed(2),
            total: total.toFixed(2)
        });
    } catch (error) {
        console.error('Error saving order:', error);
        res.send('Error occurred while processing your order');
    }
});

// Route to display orders
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find({});
        res.render('orders', { orders });
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.send('Error occurred while retrieving orders');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
