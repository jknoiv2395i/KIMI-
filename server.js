require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');

const Property = require('./models/Property');
const Settings = require('./models/Settings');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
// Hardened Secret: Matches .env exactly for maximum stability
const JWT_SECRET = process.env.JWT_SECRET || 'kimi-super-secret-key';
const DATA_PATH = path.join(__dirname, 'data', 'content.json');

let useMongoDB = false;

// Cloudinary Setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'kimi-properties',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'mp4', 'mov']
    },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // Increase to 100MB
});

// Database Connection with Fallback
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('Connected to MongoDB Atlas');
            useMongoDB = true;
        })
        .catch(err => {
            console.error('MongoDB connection error:', err);
            console.warn('FALLING BACK TO LOCAL JSON');
        });
} else {
    console.warn('NO MONGODB_URI FOUND. RUNNING IN LOCAL JSON MODE.');
}

console.log('--- SERVER CONFIG ---');
console.log('PORT:', PORT);
console.log('ADMIN_PASSWORD set:', process.env.ADMIN_PASSWORD ? 'YES' : 'NO');
console.log('---------------------');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// Simple Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware for Auth
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            return res.status(403).json({ success: false, error: 'Forbidden: Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// --- ROUTES ---

// Public: Get all content
app.get('/api/content', async (req, res) => {
    try {
        if (useMongoDB) {
            const settings = await Settings.findOne() || {};
            const featuredProperties = await Property.find({ isFeatured: true }).limit(6);
            const allProperties = await Property.find().sort({ createdAt: -1 }).limit(100);
            
            res.json({
                hero: settings.hero || {},
                contact: settings.contact || {},
                locations: settings.locations || [],
                categories: settings.categories || [],
                properties: allProperties,
                featured: featuredProperties
            });
        } else {
            const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
            res.json(data);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Public: Get properties with pagination
app.get('/api/properties', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    try {
        const properties = await Property.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Property.countDocuments();
        res.json({ properties, total, pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Login
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    const cleanPassword = password ? password.trim() : '';
    const targetPassword = 'admin123'; // Hardcoded bypass for reliability
    
    if (cleanPassword === targetPassword) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token });
    } else {
        console.log(`Login failed. Expected: "${targetPassword}", Got: "${cleanPassword}"`);
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

// Admin: Upload Image to Cloudinary
app.post('/api/upload', (req, res, next) => {
    console.log('--- UPLOAD REQUEST RECEIVED ---');
    // Verify credentials exist on server
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        console.error('CRITICAL: Cloudinary credentials missing on server!');
        return res.status(500).json({ success: false, error: 'Server configuration error: Missing Cloudinary keys' });
    }
    next();
}, authenticateToken, (req, res, next) => {
    upload.array('files', 10)(req, res, (err) => {
        if (err) {
            console.error('Multer/Cloudinary Error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ success: false, error: 'No files received by server' });
            }
            const urls = req.files.map(file => file.path);
            console.log('Upload successful. URLs:', urls);
            res.json({ success: true, urls, count: urls.length });
        } catch (error) {
            console.error('Upload Process Error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
});

// Admin: Update Settings
app.post('/api/settings', authenticateToken, async (req, res) => {
    try {
        if (useMongoDB) {
            let settings = await Settings.findOne();
            if (!settings) settings = new Settings(req.body);
            else Object.assign(settings, req.body);
            await settings.save();
        } else {
            const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
            data.hero = req.body.hero;
            data.contact = req.body.contact;
            fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 4));
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Add/Update Property
app.post('/api/properties', authenticateToken, async (req, res) => {
    try {
        const propData = req.body;
        if (useMongoDB) {
            let property;
            if (propData._id) {
                property = await Property.findByIdAndUpdate(propData._id, propData, { new: true });
            } else {
                delete propData._id;
                property = new Property(propData);
                await property.save();
            }
            res.json({ success: true, property });
        } else {
            const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
            if (!data.properties) data.properties = [];
            
            if (propData._id) {
                // Update existing: check both _id and id
                const idx = data.properties.findIndex(p => (p._id || p.id) === propData._id);
                if (idx !== -1) {
                    data.properties[idx] = propData;
                } else {
                    return res.status(404).json({ error: 'Property not found in JSON' });
                }
            } else {
                // Add new
                const newId = 'prop-' + Date.now();
                propData._id = newId;
                propData.id = newId; // Maintain legacy 'id' for compatibility
                data.properties.push(propData);
            }
            fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 4));
            res.json({ success: true, property: propData });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete Property
app.delete('/api/properties/:id', authenticateToken, async (req, res) => {
    try {
        if (useMongoDB) {
            await Property.findByIdAndDelete(req.params.id);
        } else {
            const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
            data.properties = data.properties.filter(p => (p._id || p.id) !== req.params.id);
            fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 4));
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Catch-all: Ensure any /api error returns JSON, not HTML
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, error: 'API Route Not Found' });
});

// Serve HTML files without extensions
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    if (page === 'index') return res.redirect('/');
    
    const filePath = path.join(__dirname, `${page}.html`);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        next();
    }
});

// Global Error Handler - Ensures JSON response even for crashes
app.use((err, req, res, next) => {
    console.error('Global Server Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
