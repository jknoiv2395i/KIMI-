const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    hero: {
        title: String,
        subtitle: String
    },
    contact: {
        phone: String,
        email: String,
        address: String
    },
    locations: [String],
    categories: [String]
});

module.exports = mongoose.model('Settings', settingsSchema);
