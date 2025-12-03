const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

//product prices
const products = {
    orchid: 12,
    rose: 7,
    bouquet: 20
};

// Tax rates for each province
const taxRates = {
    AB: 0.05,  // Alberta: 5% GST
    BC: 0.12,  // British Columbia: 12%
    MB: 0.12,  // Manitoba: 12%
    NB: 0.15,  // New Brunswick: 15%
    NL: 0.15,  // Newfoundland and Labrador: 15% 
    NT: 0.05,  // Northwest Territories: 5%
    NS: 0.15,  // Nova Scotia: 15%
    NU: 0.05,  // Nunavut: 5%
    ON: 0.13,  // Ontario: 13%
    PE: 0.15,  // Prince Edward Island: 15%
    QC: 0.14975, // Quebec: 14.975%
    SK: 0.11,  // Saskatchewan: 11%
    YT: 0.05   // Yukon: 5%
};

// Routes
app.get('/', (req, res) => {
    res.render('index', { errors: [], data: {} });
});
//Validation for mandatory fields
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
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('index', { errors: errors.array(), data: req.body });
    }

    // Calculate total amount
    const orderDetails = ['orchid', 'rose', 'bouquet'].map(item => ({
        name: item,
        quantity: parseInt(req.body[item]) || 0,
        price: products[item],
        total: (parseInt(req.body[item]) || 0) * products[item]
    })).filter(item => item.quantity > 0);

    const subtotal = orderDetails.reduce((sum, item) => sum + item.total, 0);

    // Checking minimum amount should not be less than $10
    if (subtotal < 10) {
        return res.render('index', { 
            errors: [{ msg: 'Minimum purchase amount is $10.' }],
            data: req.body 
        });
    }

    // Calculate tax based on selected province
    const selectedProvince = req.body.province;
    const taxRate = taxRates[selectedProvince];
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Render receipt details
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
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
