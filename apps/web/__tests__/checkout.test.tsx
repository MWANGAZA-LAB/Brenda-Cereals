import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CheckoutPage from '@/app/checkout/page'
import { CartProvider } from '@/context/CartContext'

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock the cart context
jest.mock('@/context/CartContext', () => ({
  useCart: () => ({
    items: [
      {
        id: '1',
        name: 'White Maize',
        image: '/maize-product.jpg',
        weight: '1kg',
        quantity: 2,
        price: 150,
      },
    ],
    total: 300,
    itemCount: 2,
    addItem: jest.fn(),
    removeItem: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
  }),
  CartProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock fetch
global.fetch = jest.fn()

const mockSession = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    phone: '254712345678',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return (
    <SessionProvider session={mockSession}>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          {children}
        </CartProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}

describe('Checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Checkout Page', () => {
    it('renders checkout page with authenticated user', () => {
      const mockUseSession = require('next-auth/react').useSession
      mockUseSession.mockReturnValue({ data: mockSession })

      render(
        <TestWrapper>
          <CheckoutPage />
        </TestWrapper>
      )

      expect(screen.getByText('Checkout')).toBeInTheDocument()
      expect(screen.getByText('Order Summary')).toBeInTheDocument()
      expect(screen.getByText('Delivery Information')).toBeInTheDocument()
      expect(screen.getByText('Payment Method')).toBeInTheDocument()
    })

    it('shows authentication prompt for unauthenticated users', () => {
      const mockUseSession = require('next-auth/react').useSession
      mockUseSession.mockReturnValue({ data: null })

      render(
        <TestWrapper>
          <CheckoutPage />
        </TestWrapper>
      )

      expect(screen.getByText(/Please.*sign in/)).toBeInTheDocument()
    })

    it('displays cart items in order summary', () => {
      const mockUseSession = require('next-auth/react').useSession
      mockUseSession.mockReturnValue({ data: mockSession })

      render(
        <TestWrapper>
          <CheckoutPage />
        </TestWrapper>
      )

      expect(screen.getByText('White Maize')).toBeInTheDocument()
      expect(screen.getByText('1kg × 2')).toBeInTheDocument()
      expect(screen.getByText('KSh 300')).toBeInTheDocument()
    })

    it('calculates total including delivery fee', () => {
      const mockUseSession = require('next-auth/react').useSession
      mockUseSession.mockReturnValue({ data: mockSession })

      render(
        <TestWrapper>
          <CheckoutPage />
        </TestWrapper>
      )

      expect(screen.getByText('KSh 300')).toBeInTheDocument() // Subtotal
      expect(screen.getByText('KSh 200')).toBeInTheDocument() // Delivery fee
      expect(screen.getByText('KSh 500')).toBeInTheDocument() // Total
    })

    it('pre-fills phone number from session', () => {
      const mockUseSession = require('next-auth/react').useSession
      mockUseSession.mockReturnValue({ data: mockSession })

      render(
        <TestWrapper>
          <CheckoutPage />
        </TestWrapper>
      )

      const phoneInput = screen.getByLabelText('Phone Number') as HTMLInputElement
      expect(phoneInput.value).toBe('254712345678')
    })

    it('allows selecting payment methods', () => {
      const mockUseSession = require('next-auth/react').useSession
      mockUseSession.mockReturnValue({ data: mockSession })

      render(
        <TestWrapper>
          <CheckoutPage />
        </TestWrapper>
      )

      const mpesaOption = screen.getByLabelText(/M-Pesa/)
      const bitcoinOption = screen.getByLabelText(/Bitcoin/)

      expect(mpesaOption).toBeInTheDocument()
      expect(bitcoinOption).toBeInTheDocument()
      expect(mpesaOption).toBeChecked() // M-Pesa should be default
      expect(bitcoinOption).not.toBeChecked()

      // Switch to Bitcoin
      fireEvent.click(bitcoinOption)
      expect(bitcoinOption).toBeChecked()
      expect(mpesaOption).not.toBeChecked()
    })

    it('validates delivery information before order creation', async () => {
      const mockUseSession = require('next-auth/react').useSession
      mockUseSession.mockReturnValue({ data: mockSession })

      render(
        <TestWrapper>
          <CheckoutPage />
        </TestWrapper>
      )

      const placeOrderButton = screen.getByRole('button', { name: /Place Order/ })
      
      // Clear the address field to test validation
      const addressInput = screen.getByLabelText('Delivery Address')
      fireEvent.change(addressInput, { target: { value: '' } })
      
      fireEvent.click(placeOrderButton)

      await waitFor(() => {
        expect(screen.getByText('Please fill in all delivery information')).toBeInTheDocument()
      })
    })

    it('creates order with valid information', async () => {
      const mockUseSession = require('next-auth/react').useSession
      mockUseSession.mockReturnValue({ data: mockSession })

      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'order-123' }),
      })

      render(
        <TestWrapper>
          <CheckoutPage />
        </TestWrapper>
      )

      const addressInput = screen.getByLabelText('Delivery Address')
      const placeOrderButton = screen.getByRole('button', { name: /Place Order/ })

      fireEvent.change(addressInput, { target: { value: '123 Test Street, Nairobi' } })
      fireEvent.click(placeOrderButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('123 Test Street, Nairobi'),
        })
      })
    })

    it('handles order creation errors', async () => {
      const mockUseSession = require('next-auth/react').useSession
      mockUseSession.mockReturnValue({ data: mockSession })

      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      })

      render(
        <TestWrapper>
          <CheckoutPage />
        </TestWrapper>
      )

      const addressInput = screen.getByLabelText('Delivery Address')
      const placeOrderButton = screen.getByRole('button', { name: /Place Order/ })

      fireEvent.change(addressInput, { target: { value: '123 Test Street, Nairobi' } })
      fireEvent.click(placeOrderButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to create order. Please try again.')).toBeInTheDocument()
      })
    })
  })
})
