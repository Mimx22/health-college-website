const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Server Error';
    
    // Check for specific error types (e.g. Multer)
    if (err.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Exactly 6 documents are required.';
        } else if (err.code === 'LIMIT_FILE_SIZE') {
            statusCode = 413;
            message = 'File is too large. Maximum size is 5MB.';
        }
    }
    
    // Catch file filter rejections (dangerous/unsupported types from fileFilter cb)
    if (
        message.includes('Dangerous file types') ||
        message.includes('Images and PDFs only')
    ) {
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        message,
        // Expose stack trace only in development
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = { errorHandler, notFound };
