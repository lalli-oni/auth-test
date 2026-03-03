import { generate, generateSecret, generateURI, verify } from 'otplib';
import * as QRCode from 'qrcode';
import { getUserById, updateUser } from './user.service';

export interface TotpSetupResult {
  secret: string;
  qrCodeDataUrl: string;
  otpauthUrl: string;
}

export function generateTotpSecret(): string {
  return generateSecret();
}

export async function setupTotp(
  userId: number,
): Promise<TotpSetupResult | null> {
  const user = getUserById(userId);
  if (!user) return null;

  const secret = user.totp_secret || generateTotpSecret();
  const otpauthUrl = generateURI({
    issuer: 'AuthTestApp',
    account: user.username,
    secret,
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

export async function verifyTotpAndEnable(
  userId: number,
  token: string,
): Promise<boolean> {
  const user = getUserById(userId);
  if (!user || !user.totp_secret) return false;

  const result = await verify({ token, secret: user.totp_secret });
  if (result?.valid) {
    updateUser(userId, { totp_enabled: true });
    return true;
  }

  return false;
}

export async function verifyTotp(
  userId: number,
  token: string,
): Promise<boolean> {
  const user = getUserById(userId);
  if (!user || !user.totp_enabled || !user.totp_secret) return false;

  const result = await verify({ token, secret: user.totp_secret });
  return !!result?.valid;
}

export async function getCurrentTotpCode(
  userId: number,
): Promise<{ code: string; remainingSeconds: number } | null> {
  const user = getUserById(userId);
  if (!user || !user.totp_secret) return null;

  const code = await generate({ secret: user.totp_secret });
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
