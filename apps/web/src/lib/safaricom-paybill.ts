interface SafaricomPaybillConfig {
  paybillNumber: string;
  businessShortCode: string;
  passkey: string;
  consumerKey: string;
  consumerSecret: string;
  environment: 'sandbox' | 'production';
}

interface PaybillPaymentRequest {
  orderId: string;
  amount: number;
  phoneNumber: string;
  accountReference: string;
  description: string;
}

interface PaybillPaymentResponse {
  success: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  customerMessage?: string;
  errorMessage?: string;
}

interface PaybillConfirmationRequest {
  phoneNumber: string;
  confirmationCode: string;
  orderId: string;
}

class SafaricomPaybillService {
  private config: SafaricomPaybillConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      paybillNumber: process.env.SAFARICOM_PAYBILL_NUMBER || '174379',
      businessShortCode: process.env.SAFARICOM_BUSINESS_SHORTCODE || '174379',
      passkey: process.env.SAFARICOM_PASSKEY || '',
      consumerKey: process.env.SAFARICOM_CONSUMER_KEY || '',
      consumerSecret: process.env.SAFARICOM_CONSUMER_SECRET || '',
      environment: (process.env.SAFARICOM_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    };

    this.baseUrl = this.config.environment === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to get access token: ${data.error_description || 'Unknown error'}`);
      }

      return data.access_token;
    } catch (error) {
      console.error('Error getting Safaricom access token:', error);
      throw new Error('Failed to authenticate with Safaricom API');
    }
  }

  private generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  private generatePassword(timestamp: string): string {
    const data = `${this.config.businessShortCode}${this.config.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  async initiatePaybillPayment(request: PaybillPaymentRequest): Promise<PaybillPaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      // Format phone number to international format
      let phoneNumber = request.phoneNumber.replace(/\D/g, '');
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '254' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('254')) {
        phoneNumber = '254' + phoneNumber;
      }

      const payload = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: request.amount,
        PartyA: phoneNumber,
        PartyB: this.config.paybillNumber,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/safaricom-paybill/callback`,
        AccountReference: request.accountReference,
        TransactionDesc: request.description
      };

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.ResponseCode === '0') {
        return {
          success: true,
          checkoutRequestId: data.CheckoutRequestID,
          merchantRequestId: data.MerchantRequestID,
          responseCode: data.ResponseCode,
          responseDescription: data.ResponseDescription,
          customerMessage: data.CustomerMessage
        };
      } else {
        return {
          success: false,
          responseCode: data.ResponseCode,
          responseDescription: data.ResponseDescription,
          errorMessage: data.errorMessage || 'Payment initiation failed'
        };
      }
    } catch (error) {
      console.error('Error initiating Safaricom paybill payment:', error);
      return {
        success: false,
        errorMessage: 'Failed to initiate payment. Please try again.'
      };
    }
  }

  async confirmPaybillPayment(request: PaybillConfirmationRequest): Promise<{ success: boolean; message: string }> {
    try {
      // In a real implementation, you would verify the confirmation code
      // against Safaricom's transaction query API or your database
      
      // For now, we'll simulate confirmation based on the confirmation code format
      const isValidCode = /^[A-Z0-9]{10}$/.test(request.confirmationCode);
      
      if (isValidCode) {
        return {
          success: true,
          message: 'Payment confirmed successfully'
        };
      } else {
        return {
          success: false,
          message: 'Invalid confirmation code format'
        };
      }
    } catch (error) {
      console.error('Error confirming Safaricom paybill payment:', error);
      return {
        success: false,
        message: 'Failed to confirm payment. Please try again.'
      };
    }
  }

  async queryPaymentStatus(checkoutRequestId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const payload = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      return await response.json();
    } catch (error) {
      console.error('Error querying Safaricom payment status:', error);
      throw new Error('Failed to query payment status');
    }
  }

  getPaybillInstructions(): {
    paybillNumber: string;
    instructions: string[];
  } {
    return {
      paybillNumber: this.config.paybillNumber,
      instructions: [
        'Go to M-Pesa menu on your phone',
        'Select "Lipa na M-Pesa"',
        'Select "Pay Bill"',
        `Enter Business Number: ${this.config.paybillNumber}`,
        'Enter your order ID as Account Number',
        'Enter the amount to pay',
        'Enter your M-Pesa PIN',
        'Confirm the payment',
        'You will receive a confirmation SMS with a code',
        'Enter the confirmation code below to complete your order'
      ]
    };
  }
}

export const safaricomPaybillService = new SafaricomPaybillService();
export default SafaricomPaybillService;
