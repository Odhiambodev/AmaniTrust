import { Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { SimulatedKycAdapter } from './kyc/kyc.adapter';
import { CryptoService } from './common/crypto/crypto.service';
import { MpesaIntegration } from './payments/mpesa.integration';
import { BlockchainLogger } from './blockchain/blockchain.logger';

@Module({
  providers: [
    AuthService,
    CryptoService,
    SimulatedKycAdapter,
    MpesaIntegration,
    BlockchainLogger,
  ],
  exports: [AuthService, CryptoService, MpesaIntegration, BlockchainLogger],
})
export class AppModule {}
