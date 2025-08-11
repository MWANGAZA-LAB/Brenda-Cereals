"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMaxLength = exports.validateMinLength = exports.validateRequired = exports.validatePhone = exports.validateEmail = void 0;
// Validation utilities
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePhone = (phone, country = 'KE') => {
    if (country === 'KE') {
        // Kenyan phone number validation (formats like +254..., 0..., 254...)
        const kenyanPhoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
        return kenyanPhoneRegex.test(phone.replace(/\s+/g, ''));
    }
    // US phone number validation
    const usPhoneRegex = /^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
    return usPhoneRegex.test(phone.replace(/\D/g, ''));
};
exports.validatePhone = validatePhone;
const validateRequired = (value) => {
    return value.trim().length > 0;
};
exports.validateRequired = validateRequired;
const validateMinLength = (value, minLength) => {
    return value.length >= minLength;
};
exports.validateMinLength = validateMinLength;
const validateMaxLength = (value, maxLength) => {
    return value.length <= maxLength;
};
exports.validateMaxLength = validateMaxLength;
