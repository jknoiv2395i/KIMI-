const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: String,
    priceUnit: String,
    address: String,
    location: String,
    category: String,
    status: String,
    transactionType: String,
    beds: Number,
    baths: Number,
    livingRoom: String,
    kitchen: String,
    office: String,
    area: String,
    superArea: String,
    carpetArea: String,
    plotArea: String,
    builtUpArea: String,
    areaUnit: { type: String, default: 'Sq.Ft.' },
    facing: String,
    roadWidth: String,
    isCornerPlot: { type: Boolean, default: false },
    floor: String,
    totalFloors: String,
    powerLoad: String,
    waterSupply: String,
    furnishing: String,
    parking: String,
    hasLift: { type: Boolean, default: false },
    hasGarden: { type: Boolean, default: false },
    isNegotiable: { type: Boolean, default: false },
    securityDeposit: String,
    amenities: [String],
    highlights: [String],
    droneVideo: String,
    documents: {
        satbara: String,
        saleDeed: String,
        reraCert: String,
        layoutPlan: String,
        naOrder: String
    },
    ownerName: String,
    ownerPhone: String,
    ownerWhatsapp: String,
    ownerEmail: String,
    seoTitle: String,
    seoDescription: String,
    seoKeywords: String,
    image: String, // Main image URL
    images: [String], // Array of image URLs
    videos: [String], // Array of video URLs
    description: String,
    googleMapsLink: String,
    isFeatured: { type: Boolean, default: false },
    isSoldOut: { type: Boolean, default: false },
    buyerName: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', propertySchema);
