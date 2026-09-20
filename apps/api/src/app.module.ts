import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UsersController } from './users/users.controller';
import { GroupsController } from './groups/groups.controller';
import { VerificationController } from './public-verification/verification.controller';
import { PaymentsController } from './payments/payments.controller';
import { CryptoService } from './common/crypto/crypto.service';
import { SimulatedKycAdapter } from './kyc/kyc.adapter';
import { MpesaIntegration } from './payments/mpesa.integration';
import { BlockchainLogger } from './blockchain/blockchain.logger';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      },
    }),
    AuthModule,
  ],
  controllers: [
    UsersController,
    GroupsController,
    VerificationController,
    PaymentsController,
  ],
  providers: [
    CryptoService,
    SimulatedKycAdapter,
    MpesaIntegration,
    BlockchainLogger,
  ],
})
export class AppModule {}
