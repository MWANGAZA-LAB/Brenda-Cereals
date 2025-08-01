import axios from 'axios';
import QRCode from 'qrcode';
import crypto from 'crypto';

interface BitcoinConfig {
  network: 'mainnet' | 'testnet';
  apiUrl: string;
  walletXpub?: string;
}

interface BitcoinPaymentRequest {
  amount: number; // Amount in KES
  orderId: string;
}

interface BitcoinPaymentResponse {
  address: string;
  amount: string; // Amount in BTC
  qrCode: string;
  expiresAt: Date;
}

interface BitcoinTransaction {
  txid: string;
  confirmations: number;
  amount: number;
  address: string;
}

class BitcoinService {
  private config: BitcoinConfig;
  private btcToKesRate: number = 4500000; // Approximate rate, should be fetched from API

  constructor() {
    this.config = {
      network: (process.env.BITCOIN_NETWORK as 'mainnet' | 'testnet') || 'testnet',
      apiUrl: process.env.BITCOIN_API_URL || 'https://blockstream.info/testnet/api',
      walletXpub: process.env.BITCOIN_WALLET_XPUB,
    };
  }

  private async getBitcoinPrice(): Promise<number> {
    try {
      // Fetch current BTC to USD rate
      const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice/USD.json');
      const btcToUsd = response.data.bpi.USD.rate_float;
      
      // Convert USD to KES (approximate rate: 1 USD = 150 KES)
      const usdToKes = 150;
      return btcToUsd * usdToKes;
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      // Fallback to stored rate
      return this.btcToKesRate;
    }
  }

  private generatePaymentAddress(orderId: string): string {
    // Generate a deterministic address based on order ID
    // In production, this should use proper HD wallet derivation
    const hash = crypto.createHash('sha256').update(orderId).digest('hex');
    
    if (this.config.network === 'testnet') {
      // Testnet address format (starts with tb1 for bech32)
      return 'tb1q' + hash.substring(0, 38);
    } else {
      // Mainnet address format (starts with bc1 for bech32)
      return 'bc1q' + hash.substring(0, 38);
    }
  }

  async createPayment(request: BitcoinPaymentRequest): Promise<BitcoinPaymentResponse> {
    try {
      // Get current Bitcoin price
      const btcPrice = await this.getBitcoinPrice();
      
      // Calculate BTC amount
      const btcAmount = (request.amount / btcPrice).toFixed(8);
      
      // Generate payment address
      const address = this.generatePaymentAddress(request.orderId);
      
      // Create payment URI for QR code
      const paymentUri = `bitcoin:${address}?amount=${btcAmount}&label=Brenda%20Cereals%20Order%20${request.orderId}`;
      
      // Generate QR code
      const qrCode = await QRCode.toDataURL(paymentUri, {
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Payment expires in 30 minutes
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      
      return {
        address,
        amount: btcAmount,
        qrCode,
        expiresAt,
      };
    } catch (error) {
      console.error('Error creating Bitcoin payment:', error);
      throw new Error('Failed to create Bitcoin payment');
    }
  }

  async checkPayment(address: string, expectedAmount: string): Promise<{
    paid: boolean;
    confirmations: number;
    txid?: string;
    actualAmount?: string;
  }> {
    try {
      // Get address transactions
      const response = await axios.get(`${this.config.apiUrl}/address/${address}/txs`);
      const transactions = response.data;
      
      if (!transactions || transactions.length === 0) {
        return { paid: false, confirmations: 0 };
      }
      
      // Check for payment
      for (const tx of transactions) {
        for (const output of tx.vout) {
          if (output.scriptpubkey_address === address) {
            const receivedAmount = (output.value / 100000000).toFixed(8); // Convert satoshis to BTC
            
            if (parseFloat(receivedAmount) >= parseFloat(expectedAmount)) {
              // Get confirmation count
              const latestBlockResponse = await axios.get(`${this.config.apiUrl}/blocks/tip/height`);
              const latestBlock = latestBlockResponse.data;
              const confirmations = tx.status.block_height ? (latestBlock - tx.status.block_height + 1) : 0;
              
              return {
                paid: true,
                confirmations,
                txid: tx.txid,
                actualAmount: receivedAmount,
              };
            }
          }
        }
      }
      
      return { paid: false, confirmations: 0 };
    } catch (error) {
      console.error('Error checking Bitcoin payment:', error);
      return { paid: false, confirmations: 0 };
    }
  }

  async monitorPayment(address: string, expectedAmount: string, callback: (result: any) => void): Promise<void> {
    const maxAttempts = 60; // Monitor for 30 minutes (60 * 30 seconds)
    let attempts = 0;
    
    const checkInterval = setInterval(async () => {
      attempts++;
      
      try {
        const result = await this.checkPayment(address, expectedAmount);
        
        if (result.paid) {
          clearInterval(checkInterval);
          callback({ success: true, ...result });
          return;
        }
        
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          callback({ success: false, reason: 'timeout' });
          return;
        }
      } catch (error) {
        console.error('Error monitoring Bitcoin payment:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  validateAddress(address: string): boolean {
    // Basic address validation for Bitcoin
    if (this.config.network === 'testnet') {
      return address.startsWith('tb1') || address.startsWith('2') || address.startsWith('m') || address.startsWith('n');
    } else {
      return address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3');
    }
  }

  async estimateTransactionFee(): Promise<number> {
    try {
      const response = await axios.get(`${this.config.apiUrl}/fee-estimates`);
      const feeEstimates = response.data;
      
      // Use medium priority fee (6 blocks)
      const satPerByte = feeEstimates['6'] || 10;
      
      // Estimate transaction size (typical transaction is ~250 bytes)
      const estimatedSize = 250;
      const feeSatoshis = satPerByte * estimatedSize;
      
      // Convert to BTC
      return feeSatoshis / 100000000;
    } catch (error) {
      console.error('Error estimating Bitcoin fee:', error);
      return 0.00001; // Fallback fee
    }
  }
}

export const bitcoinService = new BitcoinService();
export default BitcoinService;
