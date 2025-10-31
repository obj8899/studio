'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  FirebaseError,
} from 'firebase/auth';

type AuthCallback = (success: boolean, error?: FirebaseError) => void;

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, callback: AuthCallback): void {
  signInAnonymously(authInstance)
    .then(() => {
      callback(true);
    })
    .catch((error: FirebaseError) => {
      console.error("Anonymous sign-in error:", error);
      callback(false, error);
    });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, callback: AuthCallback): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(() => {
      callback(true);
    })
    .catch((error: FirebaseError) => {
      console.error("Email sign-up error:", error);
      callback(false, error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, callback: AuthCallback): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .then(() => {
      callback(true);
    })
    .catch((error: FirebaseError) => {
      console.error("Email sign-in error:", error);
      callback(false, error);
    });
}
