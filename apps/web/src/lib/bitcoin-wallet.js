import QRCode from 'qrcode';
class BitcoinWalletService {
    constructor() {
        this.config = {
            walletAddress: process.env.BITCOIN_WALLET_ADDRESS || '',
            network: process.env.BITCOIN_NETWORK || 'testnet',
            apiUrl: process.env.BITCOIN_API_URL || 'https://blockstream.info/testnet/api'
        };
    }
    async getBitcoinPrice() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
            const data = await response.json();
            return data.bitcoin.usd;
        }
        catch (error) {
            console.error('Error fetching Bitcoin price:', error);
            // Fallback price if API fails
            return 45000;
        }
    }
    generatePaymentAddress() {
        // In a real implementation, you would generate a unique address for each payment
        // For now, we'll use the configured wallet address
        return this.config.walletAddress;
    }
    async createPaymentRequest(request) {
        try {
            if (!this.config.walletAddress) {
                return {
                    success: false,
                    walletAddress: '',
                    btcAmount: '0',
                    qrCodeData: '',
                    qrCodeImage: '',
                    paymentUri: '',
                    expiresAt: new Date(),
                    errorMessage: 'Bitcoin wallet not configured'
                };
            }
            // Get current Bitcoin price
            const btcPrice = await this.getBitcoinPrice();
            // Calculate BTC amount (with 8 decimal places)
            const btcAmount = (request.amount / btcPrice).toFixed(8);
            // Generate payment address (in production, this should be unique per payment)
            const paymentAddress = this.generatePaymentAddress();
            // Create Bitcoin payment URI
            const paymentUri = `bitcoin:${paymentAddress}?amount=${btcAmount}&label=Brenda%20Cereals%20Order%20${request.orderId}&message=Payment%20for%20order%20${request.orderId}`;
            // Generate QR code
            const qrCodeImage = await QRCode.toDataURL(paymentUri, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            // Set expiration time (30 minutes from now)
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 30);
            return {
                success: true,
                walletAddress: paymentAddress,
                btcAmount,
                qrCodeData: paymentUri,
                qrCodeImage,
                paymentUri,
                expiresAt
            };
        }
        catch (error) {
            console.error('Error creating Bitcoin payment request:', error);
            return {
                success: false,
                walletAddress: '',
                btcAmount: '0',
                qrCodeData: '',
                qrCodeImage: '',
                paymentUri: '',
                expiresAt: new Date(),
                errorMessage: 'Failed to create Bitcoin payment request'
            };
        }
    }
    async checkPaymentStatus(address, expectedAmount) {
        try {
            // Query the blockchain API for transactions to this address
            const response = await fetch(`${this.config.apiUrl}/address/${address}/txs`);
            const transactions = await response.json();
            if (!Array.isArray(transactions) || transactions.length === 0) {
                return {
                    confirmed: false,
                    confirmations: 0
                };
            }
            // Look for transactions with the expected amount
            const expectedSatoshis = Math.round(parseFloat(expectedAmount) * 100000000); // Convert BTC to satoshis
            for (const tx of transactions) {
                // Check if this transaction sends the expected amount to our address
                for (const output of tx.vout || []) {
                    if (output.scriptpubkey_address === address) {
                        const receivedSatoshis = output.value;
                        // Allow for small differences due to rounding
                        if (Math.abs(receivedSatoshis - expectedSatoshis) <= 1000) { // 0.00001 BTC tolerance
                            // Get confirmation count
                            const latestBlockResponse = await fetch(`${this.config.apiUrl}/blocks/tip/height`);
                            const latestBlock = await latestBlockResponse.text();
                            const confirmations = tx.status.confirmed ?
                                parseInt(latestBlock) - tx.status.block_height + 1 : 0;
                            return {
                                confirmed: tx.status.confirmed,
                                confirmations,
                                txHash: tx.txid,
                                amount: (receivedSatoshis / 100000000).toFixed(8),
                                timestamp: tx.status.block_time
                            };
                        }
                    }
                }
            }
            return {
                confirmed: false,
                confirmations: 0
            };
        }
        catch (error) {
            console.error('Error checking Bitcoin payment status:', error);
            return {
                confirmed: false,
                confirmations: 0
            };
        }
    }
    async monitorPayment(address, expectedAmount, onStatusUpdate, timeoutMinutes = 30) {
        const startTime = Date.now();
        const timeoutMs = timeoutMinutes * 60 * 1000;
        const checkStatus = async () => {
            try {
                const status = await this.checkPaymentStatus(address, expectedAmount);
                onStatusUpdate(status);
                if (status.confirmed) {
                    return; // Payment confirmed, stop monitoring
                }
                if (Date.now() - startTime < timeoutMs) {
                    // Continue monitoring
                    setTimeout(checkStatus, 30000); // Check every 30 seconds
                }
                else {
                    // Timeout reached
                    onStatusUpdate({
                        confirmed: false,
                        confirmations: 0
                    });
                }
            }
            catch (error) {
                console.error('Error monitoring Bitcoin payment:', error);
                setTimeout(checkStatus, 60000); // Retry in 1 minute on error
            }
        };
        checkStatus();
    }
    validateAddress(address) {
        // Basic Bitcoin address validation
        if (!address || typeof address !== 'string') {
            return false;
        }
        // Bitcoin addresses can start with 1, 3, or bc1
        const addressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
        return addressRegex.test(address);
    }
    formatBitcoinAmount(btcAmount) {
        const amount = parseFloat(btcAmount);
        if (amount >= 1) {
            return `${amount.toFixed(8)} BTC`;
        }
        else if (amount >= 0.001) {
            return `${(amount * 1000).toFixed(5)} mBTC`;
        }
        else {
            return `${(amount * 100000000).toFixed(0)} sats`;
        }
    }
    getPaymentInstructions() {
        return [
            'Scan the QR code with your Bitcoin wallet app',
            'Or copy the Bitcoin address and amount manually',
            'Send the exact amount shown to complete payment',
            'Payment will be confirmed within 10-60 minutes',
            'Do not close this page until payment is confirmed'
        ];
    }
}
export const bitcoinWalletService = new BitcoinWalletService();
export default BitcoinWalletService;
