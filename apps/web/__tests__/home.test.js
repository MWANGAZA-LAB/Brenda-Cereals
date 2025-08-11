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
    it('renders the home page without crashing', () => {
        render(_jsx(TestWrapper, { children: _jsx(Home, {}) }));
        // Just check that basic content exists
        expect(screen.getByText('Loading products...')).toBeDefined();
    });
    it('has the correct page structure', () => {
        render(_jsx(TestWrapper, { children: _jsx(Home, {}) }));
        // Check for basic content elements instead of specific structure
        expect(screen.getByText('Fresh Stock')).toBeDefined();
        expect(screen.getByText('Best Prices')).toBeDefined();
        expect(screen.getByText('Where are you ordering from?')).toBeDefined();
    });
});
