const { authenticator } = require("otplib");
import * as QRCode from "qrcode";
import { getDatabase } from "../db/database";
import { getUserById, updateUser, type User } from "./user.service";

export interface TotpSetupResult {
  secret: string;
  qrCodeDataUrl: string;
  otpauthUrl: string;
}

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export async function setupTotp(userId: number): Promise<TotpSetupResult | null> {
  const user = getUserById(userId);
  if (!user) return null;

  const secret = generateTotpSecret();
  const otpauthUrl = authenticator.keyuri(
    user.username,
    "AuthTestApp",
    secret
  );

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

  const isValid = authenticator.verify({
    token,
    secret: user.totp_secret,
  });

  if (isValid) {
    updateUser(userId, { totp_enabled: true });
    return true;
  }

  return false;
}

export function verifyTotp(userId: number, token: string): boolean {
  const user = getUserById(userId);
  if (!user || !user.totp_enabled || !user.totp_secret) return false;

  return authenticator.verify({
    token,
    secret: user.totp_secret,
  });
}

export function getCurrentTotpCode(userId: number): { code: string; remainingSeconds: number } | null {
  const user = getUserById(userId);
  if (!user || !user.totp_secret) return null;

  const code = authenticator.generate(user.totp_secret);
  const timeStep = authenticator.options.step || 30;
  const remainingSeconds = timeStep - (Math.floor(Date.now() / 1000) % timeStep);

  return { code, remainingSeconds };
}

export function disableTotp(userId: number): boolean {
  const user = getUserById(userId);
  if (!user) return false;

  updateUser(userId, { totp_enabled: false, totp_secret: null });
  return true;
}
