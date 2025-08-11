"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatName = exports.truncate = exports.capitalize = exports.slugify = exports.generateId = void 0;
// String utilities
const generateId = (prefix) => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
};
exports.generateId = generateId;
const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};
exports.slugify = slugify;
const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
exports.capitalize = capitalize;
const truncate = (text, maxLength, suffix = '...') => {
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
};
exports.truncate = truncate;
const formatName = (firstName, lastName) => {
    return `${(0, exports.capitalize)(firstName)} ${(0, exports.capitalize)(lastName)}`;
};
exports.formatName = formatName;
