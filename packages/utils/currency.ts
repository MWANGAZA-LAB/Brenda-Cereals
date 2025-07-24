// Currency formatting utilities
export const formatCurrency = (amount: number, currency: string = 'KES'): string => {
  if (currency === 'KES') {
    return `Ksh ${amount.toLocaleString()}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatPrice = (amount: number): string => {
  return formatCurrency(amount, 'KES');
};

export const parseCurrency = (currencyString: string): number => {
  return parseFloat(currencyString.replace(/[^\d.-]/g, ''));
};
