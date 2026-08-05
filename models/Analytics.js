const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
    pageUrl: { type: String, required: true },
    elementTag: String,
    elementId: String,
    elementSelector: String,
    elementText: String,
    clickXPercent: Number, // X coordinate as % of screen width (0 - 100)
    clickYPage: Number,    // Y coordinate in pixels from document top
    screenWidth: Number,
    screenHeight: Number,
    deviceType: { type: String, default: 'Desktop' }, // 'Mobile Touch' or 'Desktop Mouse'
    isTouchDevice: { type: Boolean, default: false },
    isDeadClick: { type: Boolean, default: false },  // Clicks on non-interactive elements
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
