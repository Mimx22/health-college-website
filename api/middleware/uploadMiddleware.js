const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        // Generate random bytes to ensure unique safe filename
        const uniqueSuffix = crypto.randomBytes(8).toString('hex');
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
    }
});

// File validation
const fileFilter = (req, file, cb) => {
    // Explicitly reject dangerous executable extensions
    const dangerousExtensions = /\.(exe|sh|bat|cmd|php|js|html|htm|py|pl|rb)$/i;
    if (dangerousExtensions.test(file.originalname)) {
        return cb(new Error('Dangerous file types are not allowed!'));
    }

    const allowedExtensions = /jpg|jpeg|png|webp|gif|pdf|mp4|webm|ogg|mov|mkv|mp3|wav|aac|m4a/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    
    // Check if mime matches image, pdf, video, or audio
    const isMimeValid = file.mimetype.startsWith('image/') || 
                        file.mimetype.startsWith('video/') || 
                        file.mimetype.startsWith('audio/') || 
                        file.mimetype === 'application/pdf';

    if (extname && isMimeValid) {
        return cb(null, true);
    } else {
        cb(new Error('Only images, PDFs, videos (MP4, WebM, MOV), and audio files (MP3, WAV, AAC) are allowed!'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit to accommodate video and audio uploads
    fileFilter
});

// Admissions document upload: strictly enforce 5MB per file and PDF/JPG/PNG only
const admissionFileFilter = (req, file, cb) => {
    const dangerousExtensions = /\.(exe|sh|bat|cmd|php|js|html|htm|py|pl|rb)$/i;
    if (dangerousExtensions.test(file.originalname)) {
        return cb(new Error('Dangerous file types are not allowed!'));
    }

    const allowedExtensions = /^(jpg|jpeg|png|pdf)$/i;
    const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
    const isAllowedExt = allowedExtensions.test(ext);
    
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const isAllowedMime = allowedMimes.includes(file.mimetype.toLowerCase());

    if (isAllowedExt && isAllowedMime) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Please upload a valid PDF, JPG, JPEG, or PNG file.'));
    }
};

const admissionUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Strictly 5MB per document
    fileFilter: admissionFileFilter
});

module.exports = upload;
module.exports.upload = upload;
module.exports.admissionUpload = admissionUpload;
