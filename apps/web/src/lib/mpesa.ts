import axios from 'axios';
import CryptoJS from 'crypto-js';

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
      environment: 'sandbox', // Change to 'production' for live
    };

    this.baseUrl = this.config.environment === 'sandbox' 
      ? 'https://sandbox.safaricom.co.ke' 
      : 'https://api.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
    
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting M-Pesa access token:', error);
      throw new Error('Failed to authenticate with M-Pesa');
    }
  }

  private generatePassword(): string {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${this.config.paybillNumber}${this.config.passkey}${timestamp}`).toString('base64');
    return password;
  }

  private generateTimestamp(): string {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  }

  async initiateSTKPush(request: StkPushRequest): Promise<StkPushResponse> {
    const accessToken = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword();

    // Format phone number (remove + and ensure it starts with 254)
    let phone = request.phone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '254' + phone.slice(1);
    } else if (phone.startsWith('7') || phone.startsWith('1')) {
      phone = '254' + phone;
    }

    const payload = {
      BusinessShortCode: this.config.paybillNumber,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(request.amount),
      PartyA: phone,
      PartyB: this.config.paybillNumber,
      PhoneNumber: phone,
      CallBackURL: this.config.callbackUrl,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
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
      throw new Error('Failed to initiate M-Pesa payment');
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
      const stkCallback = callbackData.Body?.stkCallback;
      
      if (!stkCallback) {
        return { isSuccessful: false };
      }

      const resultCode = stkCallback.ResultCode;
      
      if (resultCode !== 0) {
        return { isSuccessful: false };
      }

      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const metadata: { [key: string]: any } = {};
      
      callbackMetadata.forEach((item: any) => {
        metadata[item.Name] = item.Value;
      });

      return {
        isSuccessful: true,
        transactionId: stkCallback.CheckoutRequestID,
        mpesaReceiptNumber: metadata.MpesaReceiptNumber,
        amount: metadata.Amount,
        phone: metadata.PhoneNumber,
      };
    } catch (error) {
      console.error('Error processing M-Pesa callback:', error);
      return { isSuccessful: false };
    }
  }
}

export const mpesaService = new MpesaService();
export default MpesaService;
  ResultCode: string
  ResultDesc: string
}

export class MPesaService {
  private readonly consumerKey: string
  private readonly consumerSecret: string
  private readonly shortcode: string
  private readonly passkey: string
  private readonly baseUrl: string

  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || ''
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || ''
    this.shortcode = process.env.MPESA_SHORTCODE || ''
    this.passkey = process.env.MPESA_PASSKEY || ''
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke'
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64')
    
    try {
      const response = await axios.get<MPesaTokenResponse>(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      )
      
      return response.data.access_token
    } catch (error) {
      console.error('Error getting MPesa access token:', error)
      throw new Error('Failed to get MPesa access token')
    }
  }

  private generateTimestamp(): string {
    const now = new Date()
    return now.getFullYear().toString() +
           (now.getMonth() + 1).toString().padStart(2, '0') +
           now.getDate().toString().padStart(2, '0') +
           now.getHours().toString().padStart(2, '0') +
           now.getMinutes().toString().padStart(2, '0') +
           now.getSeconds().toString().padStart(2, '0')
  }

  private generatePassword(timestamp: string): string {
    const data = this.shortcode + this.passkey + timestamp
    return Buffer.from(data).toString('base64')
  }

  async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    accountReference: string,
    transactionDesc: string,
    callbackUrl: string
  ): Promise<MPesaSTKPushResponse> {
    const accessToken = await this.getAccessToken()
    const timestamp = this.generateTimestamp()
    const password = this.generatePassword(timestamp)

    // Format phone number (remove + and ensure it starts with 254)
    const formattedPhone = phoneNumber.replace(/^\+/, '').replace(/^0/, '254')

    const requestBody = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: this.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    }

    try {
      const response = await axios.post<MPesaSTKPushResponse>(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Error initiating STK push:', error)
      throw new Error('Failed to initiate STK push')
    }
  }

  async querySTKPushStatus(checkoutRequestId: string): Promise<MPesaQueryResponse> {
    const accessToken = await this.getAccessToken()
    const timestamp = this.generateTimestamp()
    const password = this.generatePassword(timestamp)

    const requestBody = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }

    try {
      const response = await axios.post<MPesaQueryResponse>(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Error querying STK push status:', error)
      throw new Error('Failed to query STK push status')
    }
  }
}

export const mpesaService = new MPesaService()
