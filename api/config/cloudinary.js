const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'jos_medical_college_applications',
        resource_type: 'auto', // Allows non-image files like PDFs
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
});

const uploadCloudinary = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit
    }
});

module.exports = { cloudinary, uploadCloudinary };
