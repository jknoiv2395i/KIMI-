require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlfhg6zwb',
    api_key: process.env.CLOUDINARY_API_KEY || '851647893777389',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'prxGWaQ_R29ePifasdloJfkrfd4'
});

console.log('Testing Cloudinary Upload...');
const mockBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

cloudinary.uploader.upload(mockBase64, { folder: 'test-folder' })
    .then(result => {
        console.log('✅ Cloudinary Upload SUCCESS:', result.secure_url);
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Cloudinary Upload FAILED:', error);
        process.exit(1);
    });
