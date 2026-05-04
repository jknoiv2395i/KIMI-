const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'kimi-secret-key'; // In production, use env variables
const ADMIN_PASSWORD = 'admin123'; // In production, use env variables

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const DATA_PATH = path.join(__dirname, 'data', 'content.json');

// Ensure data directory and file exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

const defaultContent = {
    hero: {
        title: "We help people to realize their dream property",
        subtitle: "We are creative people who provide the best way to you who want to have a new comfortable and suitable place to live",
        location: "Any Location",
        type: "All Types"
    },
    contact: {
        phone: "+91 96969 76950",
        email: "hello@kimiproperties.in",
        address: "Nagpur, Maharashtra, India"
    },
    properties: [
        {
            id: "prop-1",
            name: "Riverbend Retreat",
            price: "$4,299",
            priceUnit: "/month",
            address: "3 Leame Close, Hull, HU3 6ND",
            category: "Residential",
            status: "Ready to Move",
            transactionType: "New",
            beds: 3,
            baths: 2,
            area: "7x7 m²",
            image: "assets/property-1.png",
            video: "",
            description: "A beautiful residential retreat offering serene views and modern amenities.",
            isFeatured: true
        },
        {
            id: "prop-2",
            name: "Oakwood Cottage",
            price: "$2,095",
            priceUnit: "/month",
            address: "2699 Green Valley, Highland Lake, FL",
            category: "Studio",
            status: "Under Construction",
            transactionType: "Resale",
            beds: 4,
            baths: 4,
            area: "6x8 m²",
            image: "assets/property-2.png",
            video: "",
            description: "A cozy and affordable studio cottage located in the heart of Highland Lake.",
            isFeatured: true
        },
        {
            id: "prop-3",
            name: "Herringbone Realty",
            price: "$5,099",
            priceUnit: "/month",
            address: "28B Highgate Road, London, NW5 1NS",
            category: "Commercial",
            status: "Ready to Move",
            transactionType: "New",
            beds: 2,
            baths: 3,
            area: "7x7 m²",
            image: "assets/property-3.png",
            video: "",
            description: "Premium commercial space perfect for high-end retail or boutique offices.",
            isFeatured: true
        }
    ]
};

if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(defaultContent, null, 4));
}

// Routes
app.get('/admin', (req, res) => {
    res.redirect('/admin.html');
});

app.get('/api/content', (req, res) => {
    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    res.json(JSON.parse(data));
});

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

app.post('/api/content', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        jwt.verify(token, SECRET_KEY);
        fs.writeFileSync(DATA_PATH, JSON.stringify(req.body, null, 4));
        res.json({ success: true });
    } catch (err) {
        res.status(403).json({ success: false, message: 'Unauthorized' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
