const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    type: { type: String, enum: ['image', 'video'] },
    data: String, // The Base64 string
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Media', mediaSchema);
