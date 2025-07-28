// src/utils/validation.js

/**
 * Validates a full name. Allows letters, spaces, hyphens, and apostrophes.
 * Minimum 2 characters.
 * @param {string} name
 * @returns {boolean}
 */
export const isValidFullName = (name) => {
    // Allows letters, spaces, hyphens, and apostrophes. Minimum 2 characters.
    return /^[a-zA-Z\s'-]{2,}$/.test(name);
};

/**
 * Validates a South African ID number (basic 13-digit check).
 * @param {string} idNumber
 * @returns {boolean}
 */
export const isValidIdNumber = (idNumber) => {
    // Basic check for 13 digits. More advanced validation (e.g., Luhn algorithm, date of birth extraction)
    // would be needed for full South African ID validation.
    return /^\d{13}$/.test(idNumber);
};

/**
 * Validates an account number. Assumes 7 to 12 digits.
 * @param {string} accountNumber
 * @returns {boolean}
 */
export const isValidAccountNumber = (accountNumber) => {
    // Assumes account numbers are 7 to 12 digits long. Adjust regex as per actual requirements.
    return /^\d{7,12}$/.test(accountNumber);
};

/**
 * Validates a password based on strong criteria.
 * At least 8 characters, one uppercase, one lowercase, one number, one special character.
 * @param {string} password
 * @returns {boolean}
 */
export const isValidPassword = (password) => {
    // At least 8 characters long
    // Contains at least one uppercase letter (A-Z)
    // Contains at least one lowercase letter (a-z)
    // Contains at least one digit (0-9)
    // Contains at least one special character (!@#$%^&*()_+={}[\]:;"'<>,.?/\|`~-)
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]).{8,}$/.test(password);
};

/**
 * Validates if two passwords match.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {boolean}
 */
export const doPasswordsMatch = (password, confirmPassword) => {
    return password === confirmPassword;
};

/**
 * Validates a payment amount. Must be a positive number with up to 2 decimal places.
 * @param {string} amount
 * @returns {boolean}
 */
export const isValidAmount = (amount) => {
    // Checks for a positive number, allowing up to two decimal places.
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && /^\d+(\.\d{1,2})?$/.test(amount);
};

/**
 * Validates a SWIFT/BIC code. 8 or 11 alphanumeric characters.
 * @param {string} swiftCode
 * @returns {boolean}
 */
export const isValidSwiftCode = (swiftCode) => {
    // SWIFT/BIC codes are typically 8 or 11 alphanumeric characters.
    return /^[A-Z0-9]{8}([A-Z0-9]{3})?$/i.test(swiftCode);
};

/**
 * Validates a currency code (e.g., USD, EUR, ZAR). Assumes 3 uppercase letters.
 * @param {string} currency
 * @returns {boolean}
 */
export const isValidCurrency = (currency) => {
    return /^[A-Z]{3}$/.test(currency);
};
