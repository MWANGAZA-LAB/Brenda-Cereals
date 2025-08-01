import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SignInPage from '@/app/auth/signin/page'

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  signIn: jest.fn(),
  getSession: jest.fn(),
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

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return (
    <SessionProvider session={null}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('SignIn Page', () => {
    it('renders the sign in form', () => {
      render(
        <TestWrapper>
          <SignInPage />
        </TestWrapper>
      )

      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('displays demo login buttons', () => {
      render(
        <TestWrapper>
          <SignInPage />
        </TestWrapper>
      )

      expect(screen.getByText(/Admin Demo/)).toBeInTheDocument()
      expect(screen.getByText(/Customer Demo/)).toBeInTheDocument()
    })

    it('validates required fields', async () => {
      render(
        <TestWrapper>
          <SignInPage />
        </TestWrapper>
      )

      const signInButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(signInButton)

      // HTML5 validation should prevent submission with empty fields
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      
      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
    })

    it('handles form submission with valid credentials', async () => {
      const mockSignIn = require('next-auth/react').signIn
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      render(
        <TestWrapper>
          <SignInPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const signInButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        })
      })
    })

    it('handles demo login for admin', async () => {
      const mockSignIn = require('next-auth/react').signIn
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      render(
        <TestWrapper>
          <SignInPage />
        </TestWrapper>
      )

      const adminDemoButton = screen.getByText(/Admin Demo/)
      fireEvent.click(adminDemoButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'admin@brendacereals.com',
          password: 'admin123',
          redirect: false,
        })
      })
    })

    it('handles demo login for customer', async () => {
      const mockSignIn = require('next-auth/react').signIn
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      render(
        <TestWrapper>
          <SignInPage />
        </TestWrapper>
      )

      const customerDemoButton = screen.getByText(/Customer Demo/)
      fireEvent.click(customerDemoButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'customer@example.com',
          password: 'password123',
          redirect: false,
        })
      })
    })

    it('displays error message on authentication failure', async () => {
      const mockSignIn = require('next-auth/react').signIn
      mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' })

      render(
        <TestWrapper>
          <SignInPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const signInButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
      })
    })
  })
})
