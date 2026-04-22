import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "elefind_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

function getRequiredServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getSessionSecret(): Uint8Array {
  return new TextEncoder().encode(getRequiredServerEnv("AUTH_SECRET"));
}

export function getAppSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

export async function createAppSessionToken(payload: {
  userId: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  role: string;
  provider: string;
}): Promise<string> {
  return new SignJWT({
    uid: payload.firebaseUid,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    provider: payload.provider,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .setIssuer("elefind-webapp")
    .sign(getSessionSecret());
}

export async function verifyAppSessionToken(token: string): Promise<{
  userId: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  role: string;
  provider: string;
}> {
  const { payload } = await jwtVerify(token, getSessionSecret(), {
    algorithms: ["HS256"],
    issuer: "elefind-webapp",
  });

  if (
    typeof payload.sub !== "string" ||
    typeof payload.uid !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.role !== "string" ||
    typeof payload.provider !== "string"
  ) {
    throw new Error("Invalid app session token.");
  }

  return {
    userId: payload.sub,
    firebaseUid: payload.uid,
    email: payload.email,
    name: typeof payload.name === "string" ? payload.name : null,
    role: payload.role,
    provider: payload.provider,
  };
}
