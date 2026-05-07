import { getAuth, type Auth } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase-app";

let authSingleton: Auth | null = null;

/** Firebase Auth — import this module only from control routes so `firebase/auth` stays out of the storefront bundle. */
export function getFirebaseAuth(): Auth {
  if (!authSingleton) {
    authSingleton = getAuth(getFirebaseApp());
  }
  return authSingleton;
}

export function prepareFirebasePhoneAuth(auth: Auth): {
  origin: string;
  authDomain: string | null;
} {
  if (typeof window === "undefined") {
    throw new Error("prepareFirebasePhoneAuth is client-only.");
  }
  auth.useDeviceLanguage();
  const origin = window.location.origin;
  const authDomain =
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || null;
  return { origin, authDomain };
}
