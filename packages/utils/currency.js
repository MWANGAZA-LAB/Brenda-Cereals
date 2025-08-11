"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCurrency = exports.formatPrice = exports.formatCurrency = void 0;
// Currency formatting utilities
const formatCurrency = (amount, currency = 'KES') => {
    if (currency === 'KES') {
        return `Ksh ${amount.toLocaleString()}`;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const formatPrice = (amount) => {
    return (0, exports.formatCurrency)(amount, 'KES');
};
exports.formatPrice = formatPrice;
const parseCurrency = (currencyString) => {
    return parseFloat(currencyString.replace(/[^\d.-]/g, ''));
};
exports.parseCurrency = parseCurrency;
