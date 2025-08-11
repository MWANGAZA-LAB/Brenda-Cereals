// String utilities
export const generateId = (prefix) => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
};
export const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};
export const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
export const truncate = (text, maxLength, suffix = '...') => {
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
};
export const formatName = (firstName, lastName) => {
    return `${capitalize(firstName)} ${capitalize(lastName)}`;
};
