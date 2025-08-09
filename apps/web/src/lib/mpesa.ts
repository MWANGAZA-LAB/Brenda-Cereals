import axios from 'axios';

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  paybillNumber: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
}

interface StkPushRequest {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface StkPushResponse {
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

class MpesaService {
  private config: MpesaConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      consumerKey: process.env.MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      passkey: process.env.MPESA_PASSKEY || '',
      paybillNumber: process.env.MPESA_PAYBILL_NUMBER || '174379',
      callbackUrl: process.env.MPESA_CALLBACK_URL || '',
      environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    };

    this.baseUrl = this.config.environment === 'sandbox' 
      ? 'https://sandbox.safaricom.co.ke' 
      : 'https://api.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(
        `${this.config.consumerKey}:${this.config.consumerSecret}`
      ).toString('base64');

      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Failed to get access token');
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

  private generatePassword(): string {
    const timestamp = this.generateTimestamp();
    const data = `${this.config.paybillNumber}${this.config.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  async initiateSTKPush(request: StkPushRequest): Promise<StkPushResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword();

      // Format phone number to international format
      let formattedPhone = request.phone.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      const requestBody = {
        BusinessShortCode: this.config.paybillNumber,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: request.amount,
        PartyA: formattedPhone,
        PartyB: this.config.paybillNumber,
        PhoneNumber: formattedPhone,
        CallBackURL: this.config.callbackUrl,
        AccountReference: request.accountReference,
        TransactionDesc: request.transactionDesc,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error initiating STK push:', error);
      throw new Error('Failed to initiate STK push');
    }
  }

  processCallback(callbackData: any): {
    isSuccessful: boolean;
    transactionId?: string;
    mpesaReceiptNumber?: string;
    amount?: number;
    phone?: string;
  } {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;
      
      if (stkCallback.ResultCode === 0) {
        const callbackMetadata = stkCallback.CallbackMetadata;
        const items = callbackMetadata.Item;
        
        const result: any = {
          isSuccessful: true,
        };
        
        items.forEach((item: any) => {
          switch (item.Name) {
            case 'MpesaReceiptNumber':
              result.mpesaReceiptNumber = item.Value;
              break;
            case 'TransactionDate':
              result.transactionId = item.Value;
              break;
            case 'Amount':
              result.amount = item.Value;
              break;
            case 'PhoneNumber':
              result.phone = item.Value;
              break;
          }
        });
        
        return result;
      } else {
        return {
          isSuccessful: false,
        };
      }
    } catch (error) {
      console.error('Error processing callback:', error);
      return {
        isSuccessful: false,
      };
    }
  }
}

export const mpesaService = new MpesaService();
