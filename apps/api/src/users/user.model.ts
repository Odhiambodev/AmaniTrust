export interface UserModel {
  id: string;
  phoneHash: string;
  encryptedPhone: string;
  nationalIdHash?: string;
  encryptedNationalId?: string;
  fullNameEncrypted?: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  kycStatus: 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'FAILED' | 'MANUAL_REVIEW';
  walletReference?: string;
  trustScore: number;
}
