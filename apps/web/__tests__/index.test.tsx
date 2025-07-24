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
  it('renders the main heading', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    const heading = screen.getAllByText('Brenda Cereals')[0]
    expect(heading).toBeInTheDocument()
  })

  it('renders the location selector', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )
    const locationText = screen.getByText('Where are you ordering from?')
    expect(locationText).toBeInTheDocument()
  })

  it('has the detect location button', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )
    const button = screen.getByRole('button', { name: 'Detect Location' })
    expect(button).toBeInTheDocument()
  })

  it('shows the hero section', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )
    const heroImage = screen.getByAltText('Farmer with cereals')
    expect(heroImage).toBeInTheDocument()
  })

  it('shows loading message', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )
    expect(screen.getByText('Loading products...')).toBeInTheDocument()
  })
})
