const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Check for specific error types (e.g. Multer)
    if (err.name === 'MulterError') {
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error',
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
