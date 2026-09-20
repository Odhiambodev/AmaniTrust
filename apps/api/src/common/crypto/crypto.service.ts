import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';

export class CryptoService {
  private readonly key = Buffer.from(process.env.FIELD_ENCRYPTION_KEY_BASE64 || '', 'base64');
  private readonly pepper = process.env.LOOKUP_HASH_PEPPER || 'default-dev-pepper';

  hashForLookup(value: string): string {
    return createHmac('sha256', this.pepper).update(value.trim().toLowerCase()).digest('hex');
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return [iv.toString('base64'), tag.toString('base64'), ciphertext.toString('base64')].join('.');
  }

  decrypt(payload: string): string {
    const [ivEncoded, tagEncoded, ciphertextEncoded] = payload.split('.');
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(ivEncoded, 'base64'));
    decipher.setAuthTag(Buffer.from(tagEncoded, 'base64'));

    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextEncoded, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  }
}
