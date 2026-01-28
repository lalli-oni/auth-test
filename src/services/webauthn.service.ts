import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticatorTransportFuture,
  CredentialDeviceType,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server/script/deps";
import { getDatabase } from "../db/database";
import { getUserById, type User } from "./user.service";

const RP_NAME = "Auth Test App";
const RP_ID = "localhost";
const ORIGIN = "http://localhost:3000";

export interface PasskeyCredential {
  id: string;
  user_id: number;
  public_key: string;
  counter: number;
  transports: string | null;
  device_type: string | null;
  backed_up: number;
  friendly_name: string | null;
  created_at: string;
}

export interface WebAuthnChallenge {
  id: number;
  user_id: number | null;
  challenge: string;
  type: string;
  expires_at: string;
}

// Challenge management
function storeChallenge(
  challenge: string,
  type: "registration" | "authentication",
  userId?: number
): void {
  const db = getDatabase();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

  // Clean up old challenges for this user/type
  if (userId) {
    db.run("DELETE FROM webauthn_challenges WHERE user_id = ? AND type = ?", [
      userId,
      type,
    ]);
  }

  db.run(
    "INSERT INTO webauthn_challenges (user_id, challenge, type, expires_at) VALUES (?, ?, ?, ?)",
    [userId || null, challenge, type, expiresAt]
  );
}

function getAndDeleteChallenge(
  type: "registration" | "authentication",
  userId?: number
): string | null {
  const db = getDatabase();

  let challenge: WebAuthnChallenge | null;
  if (userId) {
    challenge = db
      .query(
        "SELECT * FROM webauthn_challenges WHERE user_id = ? AND type = ? AND expires_at > datetime('now')"
      )
      .get(userId, type) as WebAuthnChallenge | null;
  } else {
    challenge = db
      .query(
        "SELECT * FROM webauthn_challenges WHERE user_id IS NULL AND type = ? AND expires_at > datetime('now') ORDER BY id DESC LIMIT 1"
      )
      .get(type) as WebAuthnChallenge | null;
  }

  if (!challenge) return null;

  db.run("DELETE FROM webauthn_challenges WHERE id = ?", [challenge.id]);
  return challenge.challenge;
}

// Credential management
export function getCredentialsByUserId(userId: number): PasskeyCredential[] {
  const db = getDatabase();
  return db
    .query(
      "SELECT * FROM passkey_credentials WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(userId) as PasskeyCredential[];
}

export function getCredentialById(
  credentialId: string
): PasskeyCredential | null {
  const db = getDatabase();
  return db
    .query("SELECT * FROM passkey_credentials WHERE id = ?")
    .get(credentialId) as PasskeyCredential | null;
}

export function deleteCredential(credentialId: string): boolean {
  const db = getDatabase();
  const result = db.run("DELETE FROM passkey_credentials WHERE id = ?", [
    credentialId,
  ]);
  return result.changes > 0;
}

function storeCredential(
  userId: number,
  credentialId: string,
  publicKey: Uint8Array,
  counter: number,
  transports?: AuthenticatorTransportFuture[],
  deviceType?: CredentialDeviceType,
  backedUp?: boolean,
  friendlyName?: string
): void {
  const db = getDatabase();
  db.run(
    `INSERT INTO passkey_credentials
     (id, user_id, public_key, counter, transports, device_type, backed_up, friendly_name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      credentialId,
      userId,
      Buffer.from(publicKey).toString("base64"),
      counter,
      transports ? JSON.stringify(transports) : null,
      deviceType || null,
      backedUp ? 1 : 0,
      friendlyName || null,
    ]
  );
}

function updateCredentialCounter(credentialId: string, newCounter: number): void {
  const db = getDatabase();
  db.run("UPDATE passkey_credentials SET counter = ? WHERE id = ?", [
    newCounter,
    credentialId,
  ]);
}

// Registration
export async function generateRegistrationOptionsForUser(
  userId: number
): Promise<PublicKeyCredentialCreationOptionsJSON | null> {
  const user = getUserById(userId);
  if (!user) return null;

  const existingCredentials = getCredentialsByUserId(userId);

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: user.username,
    userDisplayName: user.username,
    attestationType: "none",
    excludeCredentials: existingCredentials.map((cred) => ({
      id: cred.id,
      transports: cred.transports
        ? (JSON.parse(cred.transports) as AuthenticatorTransportFuture[])
        : undefined,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  storeChallenge(options.challenge, "registration", userId);

  return options;
}

export async function verifyRegistrationResponseForUser(
  userId: number,
  response: RegistrationResponseJSON,
  friendlyName?: string
): Promise<{ verified: boolean; error?: string }> {
  const user = getUserById(userId);
  if (!user) return { verified: false, error: "User not found" };

  const expectedChallenge = getAndDeleteChallenge("registration", userId);
  if (!expectedChallenge) {
    return { verified: false, error: "Challenge not found or expired" };
  }

  try {
    const verification: VerifiedRegistrationResponse =
      await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
      });

    if (verification.verified && verification.registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } =
        verification.registrationInfo;

      storeCredential(
        userId,
        credential.id,
        credential.publicKey,
        credential.counter,
        response.response.transports as AuthenticatorTransportFuture[],
        credentialDeviceType,
        credentialBackedUp,
        friendlyName
      );

      return { verified: true };
    }

    return { verified: false, error: "Verification failed" };
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Authentication
export async function generateAuthenticationOptionsForUser(
  userId?: number
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  let allowCredentials: { id: string; transports?: AuthenticatorTransportFuture[] }[] = [];

  if (userId) {
    const credentials = getCredentialsByUserId(userId);
    allowCredentials = credentials.map((cred) => ({
      id: cred.id,
      transports: cred.transports
        ? (JSON.parse(cred.transports) as AuthenticatorTransportFuture[])
        : undefined,
    }));
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
    userVerification: "preferred",
  });

  storeChallenge(options.challenge, "authentication", userId);

  return options;
}

export async function verifyAuthenticationResponseForUser(
  response: AuthenticationResponseJSON,
  userId?: number
): Promise<{
  verified: boolean;
  userId?: number;
  error?: string;
}> {
  // Find the credential
  const credential = getCredentialById(response.id);
  if (!credential) {
    return { verified: false, error: "Credential not found" };
  }

  // If userId was provided, verify it matches
  if (userId && credential.user_id !== userId) {
    return { verified: false, error: "Credential does not belong to user" };
  }

  const expectedChallenge = getAndDeleteChallenge(
    "authentication",
    userId || credential.user_id
  );
  if (!expectedChallenge) {
    return { verified: false, error: "Challenge not found or expired" };
  }

  try {
    const verification: VerifiedAuthenticationResponse =
      await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: credential.id,
          publicKey: new Uint8Array(
            Buffer.from(credential.public_key, "base64")
          ),
          counter: credential.counter,
          transports: credential.transports
            ? (JSON.parse(credential.transports) as AuthenticatorTransportFuture[])
            : undefined,
        },
      });

    if (verification.verified) {
      // Update counter
      updateCredentialCounter(
        credential.id,
        verification.authenticationInfo.newCounter
      );

      return { verified: true, userId: credential.user_id };
    }

    return { verified: false, error: "Verification failed" };
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Find user by credential ID (for passkey-only login)
export function getUserByCredentialId(credentialId: string): User | null {
  const credential = getCredentialById(credentialId);
  if (!credential) return null;
  return getUserById(credential.user_id);
}
