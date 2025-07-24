import axios from 'axios'

interface MPesaTokenResponse {
  access_token: string
  expires_in: string
}

interface MPesaSTKPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

interface MPesaQueryResponse {
  ResponseCode: string
  ResponseDescription: string
  MerchantRequestID: string
  CheckoutRequestID: string
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
