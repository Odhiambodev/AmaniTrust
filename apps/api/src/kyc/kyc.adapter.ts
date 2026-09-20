export interface KycVerificationRequest {
  nationalId: string;
  phoneNumber: string;
  consentReference: string;
}

export interface KycVerificationResult {
  status: 'VERIFIED' | 'FAILED' | 'MANUAL_REVIEW';
  providerReference: string;
  reason?: string;
}

export interface KycAdapter {
  verifyIdentity(request: KycVerificationRequest): Promise<KycVerificationResult>;
}

export class SimulatedKycAdapter implements KycAdapter {
  async verifyIdentity(request: KycVerificationRequest): Promise<KycVerificationResult> {
    if (!request.nationalId || !request.phoneNumber) {
      return {
        status: 'FAILED',
        providerReference: `sim-${Date.now()}`,
        reason: 'Missing identity fields',
      };
    }

    return {
      status: 'VERIFIED',
      providerReference: `sim-${Date.now()}`,
    };
  }
}
