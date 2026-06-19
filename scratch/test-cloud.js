require('dotenv').config();
const cloudinary = require('cloudinary').v2;

async function testCloud(cloudName) {
    console.log(`Testing Cloudinary Upload for cloud: "${cloudName}"...`);
    cloudinary.config({
        cloud_name: cloudName,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const mockBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    try {
        const result = await cloudinary.uploader.upload(mockBase64, { folder: 'test-folder' });
        console.log(`✅ Cloudinary Upload SUCCESS for "${cloudName}":`, result.secure_url);
        return true;
    } catch (error) {
        console.error(`❌ Cloudinary Upload FAILED for "${cloudName}":`, error.message || error);
        return false;
    }
}

async function run() {
    const success1 = await testCloud('dlfhg6zwb');
    const success2 = await testCloud('awdadaw');
    process.exit(success1 || success2 ? 0 : 1);
}

run();

