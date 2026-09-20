const fs = require('fs');

/**
 * Validates the file using its magic bytes.
 * @param {string} filePath - The path to the file.
 * @param {string} mimeType - The expected MIME type.
 * @returns {boolean} - True if valid, false otherwise.
 */
const isValidMagicBytes = (filePath, mimeType) => {
    try {
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(8);
        fs.readSync(fd, buffer, 0, 8, 0);
        fs.closeSync(fd);

        const hex = buffer.toString('hex').toUpperCase();

        if (mimeType === 'application/pdf') {
            // PDF magic bytes: %PDF- (25504446)
            return hex.startsWith('25504446');
        } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
            // JPEG magic bytes: FFD8FF
            return hex.startsWith('FFD8FF');
        } else if (mimeType === 'image/png') {
            // PNG magic bytes: 89504E470D0A1A0A
            return hex.startsWith('89504E470D0A1A0A');
        }

        return false;
    } catch (err) {
        console.error(`Failed to read file ${filePath}:`, err);
        return false;
    }
};

module.exports = { isValidMagicBytes };
