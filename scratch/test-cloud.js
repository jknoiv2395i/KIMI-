require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlfhg6zwb',
    api_key: process.env.CLOUDINARY_API_KEY || '851647893777389',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'prxGWaQ_R29ePifasdloJfkrfd4'
});

console.log('Testing Cloudinary Connection...');
cloudinary.api.ping()
    .then(result => {
        console.log('✅ Cloudinary Connection SUCCESS:', result);
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Cloudinary Connection FAILED:', error.message);
        process.exit(1);
    });
