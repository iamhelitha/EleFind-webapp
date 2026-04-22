import { decodeProtectedHeader, importX509, jwtVerify } from "jose";

const FIREBASE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

interface CachedFirebaseCerts {
  keys: Map<string, Awaited<ReturnType<typeof importX509>>>;
  expiresAt: number;
}

let cachedFirebaseCerts: CachedFirebaseCerts | null = null;

function getRequiredServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getMaxAgeSeconds(cacheControl: string | null): number {
  if (!cacheControl) {
    return 0;
  }

  const match = cacheControl.match(/max-age=(\d+)/i);
  return match ? Number(match[1]) : 0;
}

async function getFirebaseVerificationKey(kid: string): Promise<Awaited<ReturnType<typeof importX509>>> {
  const now = Date.now();

  if (cachedFirebaseCerts && cachedFirebaseCerts.expiresAt > now) {
    const cachedKey = cachedFirebaseCerts.keys.get(kid);
    if (cachedKey) {
      return cachedKey;
    }
  }

  const response = await fetch(FIREBASE_CERTS_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load Firebase verification certificates.");
  }

  const maxAgeSeconds = getMaxAgeSeconds(response.headers.get("cache-control"));
  const certs = (await response.json()) as Record<string, string>;
  const entries = await Promise.all(
    Object.entries(certs).map(async ([certKid, certificate]) => [
      certKid,
      await importX509(certificate, "RS256"),
    ] as const)
  );

  cachedFirebaseCerts = {
    keys: new Map(entries),
    expiresAt: now + maxAgeSeconds * 1000,
  };

  const verificationKey = cachedFirebaseCerts.keys.get(kid);
  if (!verificationKey) {
    throw new Error("No matching Firebase certificate found for token key id.");
  }

  return verificationKey;
}

export interface VerifiedFirebaseIdToken {
  uid: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  provider: string;
  authTime: number;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseIdToken> {
  const projectId = getRequiredServerEnv("FIREBASE_PROJECT_ID");

  const { kid, alg } = decodeProtectedHeader(idToken);
  if (alg !== "RS256" || typeof kid !== "string") {
    throw new Error("Unsupported Firebase ID token signature.");
  }

  const verificationKey = await getFirebaseVerificationKey(kid);

  const { payload } = await jwtVerify(idToken, verificationKey, {
    algorithms: ["RS256"],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  });

  if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
    throw new Error("Authenticated user is missing required Firebase claims.");
  }

  return {
    uid: payload.sub,
    email: payload.email,
    name: typeof payload.name === "string" ? payload.name : null,
    emailVerified: Boolean(payload.email_verified),
    authTime: typeof payload.auth_time === "number" ? payload.auth_time : 0,
    provider: (() => {
      const firebaseClaims = payload.firebase as Record<string, unknown> | undefined;
      return typeof firebaseClaims?.sign_in_provider === "string"
        ? firebaseClaims.sign_in_provider
        : "firebase";
    })(),
  };
}
