const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    type: { type: String, default: 'General Inquiry' },
    name: { type: String, default: 'Prospective Client' },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    requirement: { type: String, default: '' },
    propertyTitle: { type: String, default: '' },
    location: { type: String, default: '' },
    status: { type: String, default: 'new' },
    source: { type: String, default: 'website' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);
