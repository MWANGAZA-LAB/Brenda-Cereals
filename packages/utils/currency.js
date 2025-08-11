// Currency formatting utilities
export const formatCurrency = (amount, currency = 'KES') => {
    if (currency === 'KES') {
        return `Ksh ${amount.toLocaleString()}`;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};
export const formatPrice = (amount) => {
    return formatCurrency(amount, 'KES');
};
export const parseCurrency = (currencyString) => {
    return parseFloat(currencyString.replace(/[^\d.-]/g, ''));
};
