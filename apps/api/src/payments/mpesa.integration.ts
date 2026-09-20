import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';

interface MpesaTokenResponse {
  access_token: string;
  expires_in: string;
}

@Injectable()
export class MpesaIntegration {
  private readonly baseUrl =
    process.env.MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  private token?: { value: string; expiresAt: number };

  async initiateStkPush(input: {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDescription: string;
  }) {
    const token = await this.getAccessToken();
    const timestamp = this.formatTimestamp();
    const shortcode = process.env.MPESA_SHORTCODE || '174379';
    const passkey = process.env.MPESA_PASSKEY || '';
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(input.amount),
        PartyA: input.phoneNumber,
        PartyB: shortcode,
        PhoneNumber: input.phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: input.accountReference,
        TransactionDesc: input.transactionDescription,
      }),
    });

    if (!response.ok) {
      throw new BadGatewayException('M-Pesa STK request failed');
    }

    return response.json();
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now()) {
      return this.token.value;
    }

    const credentials = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`,
    ).toString('base64');

    const response = await fetch(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    if (!response.ok) {
      throw new ServiceUnavailableException('Unable to authenticate with M-Pesa');
    }

    const data = (await response.json()) as MpesaTokenResponse;
    this.token = {
      value: data.access_token,
      expiresAt: Date.now() + Number(data.expires_in) * 1000 - 30_000,
    };

    return this.token.value;
  }

  private formatTimestamp(): string {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join('');
  }
}
