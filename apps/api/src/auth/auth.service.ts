import { createHmac, randomInt } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  TooManyRequestsException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { CryptoService } from '../common/crypto/crypto.service';
import { SimulatedKycAdapter } from '../kyc/kyc.adapter';

@Injectable()
export class AuthService {
  private readonly prisma = new PrismaClient();

  constructor(
    private readonly crypto: CryptoService,
    private readonly jwt: JwtService,
    private readonly kyc: SimulatedKycAdapter,
  ) {}

  async requestOtp(phoneNumber: string): Promise<{ challengeId: string }> {
    const normalizedPhone = this.normalizeKenyanPhone(phoneNumber);
    const phoneHash = this.crypto.hashForLookup(normalizedPhone);

    const recentRequests = await this.prisma.otpChallenge.count({
      where: {
        phoneHash,
        createdAt: {
          gt: new Date(Date.now() - 10 * 60 * 1000),
        },
      },
    });

    if (recentRequests >= 3) {
      throw new TooManyRequestsException('Too many OTP requests. Try again later.');
    }

    const code = randomInt(100000, 900000).toString();
    const codeHash = createHmac('sha256', process.env.JWT_SECRET || 'dev-secret')
      .update(code)
      .digest('hex');

    const challenge = await this.prisma.otpChallenge.create({
      data: {
        phoneHash,
        codeHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await this.sendSms(notificationPhone(normalizedPhone), `Your AmaniTrust code is ${code}`);

    return { challengeId: challenge.id };
  }

  async verifyOtp(challengeId: string, phoneNumber: string, code: string) {
    const normalizedPhone = this.normalizeKenyanPhone(phoneNumber);
    const phoneHash = this.crypto.hashForLookup(normalizedPhone);
    const codeHash = createHmac('sha256', process.env.JWT_SECRET || 'dev-secret')
      .update(code)
      .digest('hex');

    const challenge = await this.prisma.otpChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge || challenge.phoneHash !== phoneHash || challenge.consumedAt || challenge.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (challenge.codeHash !== codeHash) {
      await this.prisma.otpChallenge.update({
        where: { id: challengeId },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid OTP');
    }

    const user = await this.prisma.user.upsert({
      where: { phoneHash },
      update: {},
      create: {
        phoneHash,
        encryptedPhone: this.crypto.encrypt(normalizedPhone),
      },
    });

    await this.prisma.otpChallenge.update({
      where: { id: challengeId },
      data: {
        consumedAt: new Date(),
        userId: user.id,
      },
    });

    const accessToken = await this.jwt.signAsync({ sub: user.id, phoneHash });

    return {
      accessToken,
      userId: user.id,
    };
  }

  async completeKyc(userId: string, nationalId: string, consentReference: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const request = {
      nationalId,
      phoneNumber: this.crypto.decrypt(user.encryptedPhone),
      consentReference,
    };

    const result = await this.kyc.verifyIdentity(request);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        nationalIdHash: this.crypto.hashForLookup(nationalId),
        encryptedNationalId: this.crypto.encrypt(nationalId),
        kycStatus: result.status,
        kycProviderRef: result.providerReference,
      },
    });

    return updated;
  }

  private normalizeKenyanPhone(phone: string): string {
    const value = phone.replace(/\s+/g, '');

    if (value.startsWith('07')) return `+254${value.substring(1)}`;
    if (value.startsWith('01')) return `+254${value.substring(1)}`;
    if (value.startsWith('254')) return `+${value}`;
    if (value.startsWith('+254')) return value;

    throw new BadRequestException('Invalid Kenyan phone number');
  }

  private async sendSms(phone: string, message: string): Promise<void> {
    console.log(`SMS to ${phone}: ${message}`);
  }
}

function notificationPhone(phone: string): string {
  return phone;
}
