interface FirebaseErrorShape {
  code?: string;
  message?: string;
}

const MESSAGE_BY_CODE: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/email-already-in-use": "This email is already in use.",
  "auth/weak-password": "Password is too weak. Please use a stronger password.",
  "auth/popup-closed-by-user": "Sign-in was cancelled. Please try again.",
  "auth/popup-blocked": "Popup was blocked by your browser. Please allow popups and retry.",
  "auth/cancelled-popup-request": "Another sign-in is already in progress. Please try again.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/network-request-failed": "Network error. Please check your connection and retry.",
  "auth/unauthorized-domain": "This domain is not authorised for Google sign-in. Add it to Firebase → Authentication → Authorised Domains.",
  "auth/web-storage-unsupported": "Your browser is blocking storage required for Google sign-in. Try disabling private browsing or browser extensions.",
  "auth/operation-not-supported-in-this-environment": "Google sign-in is not supported in this browser environment.",
};

export function getFirebaseAuthErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const maybeError = error as FirebaseErrorShape;
    if (maybeError.code && MESSAGE_BY_CODE[maybeError.code]) {
      return MESSAGE_BY_CODE[maybeError.code];
    }
    // Surface the actual message for non-Firebase errors (e.g. server errors from session-login)
    if (!maybeError.code && typeof maybeError.message === "string" && maybeError.message) {
      return maybeError.message;
    }
  }

  return fallback;
}
