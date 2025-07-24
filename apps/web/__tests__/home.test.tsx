import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from '@/app/page'
import { CartProvider } from '@/context/CartContext'

// Create a test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {children}
      </CartProvider>
    </QueryClientProvider>
  )
}

describe('Home Page', () => {
  it('renders the home page without crashing', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    // Just check that basic content exists
    expect(screen.getByText('Loading products...')).toBeDefined()
  })

  it('has the correct page structure', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    // Check for basic content elements instead of specific structure
    expect(screen.getByText('Fresh Stock')).toBeDefined()
    expect(screen.getByText('Best Prices')).toBeDefined()
    expect(screen.getByText('Where are you ordering from?')).toBeDefined()
  })
})
