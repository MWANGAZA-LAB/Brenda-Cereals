import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from '@/app/page';
import { CartProvider } from '@/context/CartContext';
// Create a test wrapper with providers
const TestWrapper = ({ children }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(CartProvider, { children: children }) }));
};
describe('Home Page', () => {
    it('renders the main heading', () => {
        render(_jsx(TestWrapper, { children: _jsx(Home, {}) }));
        const heading = screen.getAllByText('Brenda Cereals')[0];
        expect(heading).toBeInTheDocument();
    });
    it('renders the location selector', () => {
        render(_jsx(TestWrapper, { children: _jsx(Home, {}) }));
        const locationText = screen.getByText('Where are you ordering from?');
        expect(locationText).toBeInTheDocument();
    });
    it('has the detect location button', () => {
        render(_jsx(TestWrapper, { children: _jsx(Home, {}) }));
        const button = screen.getByRole('button', { name: 'Detect Location' });
        expect(button).toBeInTheDocument();
    });
    it('shows the hero section', () => {
        render(_jsx(TestWrapper, { children: _jsx(Home, {}) }));
        const heroImage = screen.getByAltText('Farmer with cereals');
        expect(heroImage).toBeInTheDocument();
    });
    it('shows loading message', () => {
        render(_jsx(TestWrapper, { children: _jsx(Home, {}) }));
        expect(screen.getByText('Loading products...')).toBeInTheDocument();
    });
});
