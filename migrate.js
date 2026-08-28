require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Property = require('./models/Property');
const Settings = require('./models/Settings');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for migration...');

        const DATA_PATH = path.join(__dirname, 'data', 'content.json');
        const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

        // 1. Migrate Settings
        console.log('Migrating Settings...');
        const settingsData = {
            hero: data.hero,
            contact: data.contact,
            locations: ["Dharampeth", "Sadar", "Sitabuldi", "Wardha Road", "Manish Nagar", "Ramdaspeth", "Nagpur", "Mumbai", "Pune"],
            categories: ["Residential (Purchase)", "Residential Rental", "Commercial (Purchase)", "Commercial Rental", "Industrial", "Plots", "Agricultural Land"]
        };

        await Settings.findOneAndUpdate({}, settingsData, { upsert: true, new: true });
        console.log('Settings migrated successfully.');

        // 2. Migrate Properties
        console.log(`Migrating ${data.properties.length} properties...`);
        for (const prop of data.properties) {
            // Clean up ID to avoid Mongoose conflicts
            const cleanProp = { ...prop };
            delete cleanProp.id;
            delete cleanProp._id;

            // Ensure arrays exist
            cleanProp.images = cleanProp.image ? [cleanProp.image] : [];
            cleanProp.videos = cleanProp.video ? [cleanProp.video] : [];

            await Property.create(cleanProp);
        }

        console.log('All properties migrated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
