import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { Auth } from "firebase-admin/auth";

function getRequiredServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let app: App | null = null;
let auth: Auth | null = null;

function getFirebaseAdminApp(): App {
  if (app) {
    return app;
  }

  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }

  const privateKey = getRequiredServerEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

  app = initializeApp({
    credential: cert({
      projectId: getRequiredServerEnv("FIREBASE_PROJECT_ID"),
      clientEmail: getRequiredServerEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey,
    }),
  });

  return app;
}

export function getFirebaseAdminAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseAdminApp());
  }

  return auth;
}
