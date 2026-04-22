import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

const firebasePublicEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
} as const;

const firebaseConfig = {
  apiKey: firebasePublicEnv.apiKey,
  authDomain: firebasePublicEnv.authDomain,
  projectId: firebasePublicEnv.projectId,
  appId: firebasePublicEnv.appId,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

const requiredFirebaseEnvEntries = [
  ["NEXT_PUBLIC_FIREBASE_API_KEY", firebasePublicEnv.apiKey],
  ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", firebasePublicEnv.authDomain],
  ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", firebasePublicEnv.projectId],
  ["NEXT_PUBLIC_FIREBASE_APP_ID", firebasePublicEnv.appId],
] as const;

let firebaseAuthInstance: Auth | null = null;
let firebaseGoogleProviderInstance: GoogleAuthProvider | null = null;

function getFirebaseApp() {
  const missingKeys = requiredFirebaseEnvEntries
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missingKeys.length > 0) {
    throw new Error(`Missing required Firebase public env vars: ${missingKeys.join(", ")}`);
  }

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth client is only available in the browser.");
  }

  if (!firebaseAuthInstance) {
    firebaseAuthInstance = getAuth(getFirebaseApp());
  }

  return firebaseAuthInstance;
}

export function getFirebaseGoogleProvider(): GoogleAuthProvider {
  if (!firebaseGoogleProviderInstance) {
    firebaseGoogleProviderInstance = new GoogleAuthProvider();
  }

  return firebaseGoogleProviderInstance;
}
