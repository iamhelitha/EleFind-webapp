interface FirebaseErrorShape {
  code?: string;
}

const MESSAGE_BY_CODE: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/email-already-in-use": "This email is already in use.",
  "auth/weak-password": "Password is too weak. Please use a stronger password.",
  "auth/popup-closed-by-user": "Sign-in popup was closed before completing authentication.",
  "auth/popup-blocked": "Popup was blocked by your browser. Please allow popups and retry.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/network-request-failed": "Network error. Please check your connection and retry.",
};

export function getFirebaseAuthErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const maybeError = error as FirebaseErrorShape;
    if (maybeError.code && MESSAGE_BY_CODE[maybeError.code]) {
      return MESSAGE_BY_CODE[maybeError.code];
    }
  }

  return fallback;
}
