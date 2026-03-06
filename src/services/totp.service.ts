import {
  generateSecret,
  generateSync,
  generateURI,
  NobleCryptoPlugin,
  ScureBase32Plugin,
  verifySync,
} from 'otplib';
import * as QRCode from 'qrcode';
import { getUserById, updateUser } from './user.service';

const crypto = new NobleCryptoPlugin();
const base32 = new ScureBase32Plugin();

export interface TotpSetupResult {
  secret: string;
  qrCodeDataUrl: string;
  otpauthUrl: string;
}

export function generateTotpSecret(): string {
  return generateSecret({ crypto, base32 });
}

export async function setupTotp(
  userId: number,
): Promise<TotpSetupResult | null> {
  const user = getUserById(userId);
  if (!user) return null;

  const secret = generateTotpSecret();
  const otpauthUrl = generateURI({
    secret,
    issuer: 'AuthTestApp',
    accountName: user.username,
  });

  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  // Store the secret but don't enable TOTP yet (user must verify first)
  updateUser(userId, { totp_secret: secret });

  return {
    secret,
    qrCodeDataUrl,
    otpauthUrl,
  };
}

export function verifyTotpAndEnable(userId: number, token: string): boolean {
  const user = getUserById(userId);
  if (!user || !user.totp_secret) return false;

  const result = verifySync({
    token,
    secret: user.totp_secret,
    crypto,
    base32,
  });
  const isValid = result.valid;

  if (isValid) {
    updateUser(userId, { totp_enabled: true });
    return true;
  }

  return false;
}

export function verifyTotp(userId: number, token: string): boolean {
  const user = getUserById(userId);
  if (!user || !user.totp_enabled || !user.totp_secret) return false;

  return verifySync({
    token,
    secret: user.totp_secret,
    crypto,
    base32,
  }).valid;
}

export function getCurrentTotpCode(
  userId: number,
): { code: string; remainingSeconds: number } | null {
  const user = getUserById(userId);
  if (!user || !user.totp_secret) return null;

  const code = generateSync({ secret: user.totp_secret, crypto, base32 });
  const timeStep = 30;
  const remainingSeconds =
    timeStep - (Math.floor(Date.now() / 1000) % timeStep);

  return { code, remainingSeconds };
}

export function disableTotp(userId: number): boolean {
  const user = getUserById(userId);
  if (!user) return false;

  updateUser(userId, { totp_enabled: false, totp_secret: null });
  return true;
}
