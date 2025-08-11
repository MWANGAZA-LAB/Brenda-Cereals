import { formatCurrency, formatPrice } from '@brenda-cereals/utils';
describe('Currency Utils', () => {
    describe('formatCurrency', () => {
        it('formats KES currency correctly', () => {
            expect(formatCurrency(1000, 'KES')).toBe('Ksh 1,000');
            expect(formatCurrency(500.50, 'KES')).toBe('Ksh 500.5');
        });
        it('formats USD currency correctly', () => {
            expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
        });
        it('defaults to KES when no currency specified', () => {
            expect(formatCurrency(1000)).toBe('Ksh 1,000');
        });
    });
    describe('formatPrice', () => {
        it('formats price in KES', () => {
            expect(formatPrice(250)).toBe('Ksh 250');
            expect(formatPrice(1500)).toBe('Ksh 1,500');
        });
    });
});
