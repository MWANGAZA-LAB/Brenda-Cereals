import axios from 'axios'

interface BitcoinInvoice {
  id: string
  amount: number
  currency: string
  description: string
  paymentRequest: string
  checkoutUrl: string
  status: 'pending' | 'paid' | 'expired'
}

interface LightningInvoice {
  payment_request: string
  payment_hash: string
  amount_msat: number
  expires_at: number
}

export class BitcoinPaymentService {
  private readonly walletAddress: string
  private readonly lightningNodeUrl: string

  constructor() {
    this.walletAddress = process.env.BITCOIN_WALLET_ADDRESS || ''
    this.lightningNodeUrl = process.env.LIGHTNING_INVOICE_URL || ''
  }

  /**
   * Generate a Bitcoin payment URI for on-chain payments
   */
  generateBitcoinPaymentURI(amount: number, label: string, message: string): string {
    const btcAmount = (amount / 100000000).toFixed(8) // Convert satoshis to BTC
    
    const params = new URLSearchParams({
      amount: btcAmount,
      label: label,
      message: message,
    })

    return `bitcoin:${this.walletAddress}?${params.toString()}`
  }

  /**
   * Create a Lightning Network invoice
   */
  async createLightningInvoice(
    amountSats: number,
    description: string,
    expiry: number = 3600
  ): Promise<LightningInvoice> {
    try {
      // This is a mock implementation
      // In a real scenario, you'd integrate with your Lightning node
      const mockInvoice: LightningInvoice = {
        payment_request: `lnbc${amountSats}n1pw...`, // Mock Lightning invoice
        payment_hash: Math.random().toString(36).substring(7),
        amount_msat: amountSats * 1000,
        expires_at: Date.now() + (expiry * 1000)
      }

      return mockInvoice
    } catch (error) {
      console.error('Error creating Lightning invoice:', error)
      throw new Error('Failed to create Lightning invoice')
    }
  }

  /**
   * Check if a Lightning invoice has been paid
   */
  async checkLightningPayment(paymentHash: string): Promise<boolean> {
    try {
      // Mock implementation
      // In real scenario, query your Lightning node
      return Math.random() > 0.5 // Randomly return paid/unpaid for demo
    } catch (error) {
      console.error('Error checking Lightning payment:', error)
      return false
    }
  }

  /**
   * Convert fiat amount to satoshis using current BTC price
   */
  async convertToSatoshis(fiatAmount: number, currency: string = 'KES'): Promise<number> {
    try {
      // Get current BTC price from a public API
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency.toLowerCase()}`)
      const btcPrice = response.data.bitcoin[currency.toLowerCase()]
      
      const btcAmount = fiatAmount / btcPrice
      const satoshis = Math.round(btcAmount * 100000000)
      
      return satoshis
    } catch (error) {
      console.error('Error converting to satoshis:', error)
      // Fallback conversion rate (1 USD = ~2500 sats as example)
      return Math.round((fiatAmount / 40) * 2500) // Rough KES to sats conversion
    }
  }

  /**
   * Generate QR code data for payment
   */
  generateQRCodeData(paymentString: string): string {
    return paymentString
  }

  /**
   * Validate Bitcoin address
   */
  isValidBitcoinAddress(address: string): boolean {
    // Basic Bitcoin address validation
    const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/
    return btcRegex.test(address)
  }
}

export const bitcoinService = new BitcoinPaymentService()
