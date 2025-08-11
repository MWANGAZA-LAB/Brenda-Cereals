import '@testing-library/jest-dom';
import React from 'react';
// Mock next/router
jest.mock('next/router', () => ({
    useRouter: () => ({
        route: '/',
        pathname: '/',
        query: '',
        asPath: '/',
        push: jest.fn(),
        pop: jest.fn(),
        reload: jest.fn(),
        back: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
        },
    }),
}));
// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}));
// Mock NextAuth
jest.mock('next-auth/react', () => ({
    useSession: () => ({ data: null, status: 'unauthenticated' }),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    SessionProvider: ({ children }) => children,
}));
// Mock next-auth for server-side
jest.mock('next-auth', () => ({
    getServerSession: jest.fn(),
}));
// Mock Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: function MockImage(props) {
        return React.createElement('img', { ...props, alt: props.alt });
    },
}));
// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.DATABASE_URL = 'file:./test.db';
// Mock window.matchMedia (only for jsdom environment)
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });
}
// Mock IntersectionObserver (only for jsdom environment)
if (typeof window !== 'undefined') {
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        disconnect: jest.fn(),
        unobserve: jest.fn(),
    }));
    // Mock ResizeObserver (only for jsdom environment)
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        disconnect: jest.fn(),
        unobserve: jest.fn(),
    }));
}
