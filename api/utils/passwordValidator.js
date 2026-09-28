/**
 * Password validation utilities for Medical Career College
 */

/**
 * Validates a student password according to institutional security policy:
 * 1. Minimum length: 8 characters.
 * 2. First character MUST be uppercase A-Z.
 *
 * @param {string} password - The password string to validate
 * @returns {{ isValid: boolean, message: string }}
 */
function validateStudentPassword(password) {
    if (!password || typeof password !== 'string') {
        return {
            isValid: false,
            message: 'Password is required'
        };
    }

    if (password.length < 8) {
        return {
            isValid: false,
            message: 'Password must be at least 8 characters long'
        };
    }

    const firstChar = password.charAt(0);
    if (!/^[A-Z]$/.test(firstChar)) {
        return {
            isValid: false,
            message: 'Password must begin with an uppercase letter (A-Z)'
        };
    }

    return {
        isValid: true,
        message: 'Password is valid'
    };
}

module.exports = {
    validateStudentPassword
};
