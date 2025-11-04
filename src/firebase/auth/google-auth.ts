
'use client';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  Firestore,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// This function handles the Google Sign-In process
export async function handleGoogleSignIn(
  auth: Auth,
  firestore: Firestore
): Promise<boolean> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // After successful sign-in, check if user profile exists or create/update it
    await createOrUpdateProfileOnLogin(firestore, user);

    return true; // Indicate success
  } catch (error: any) {
    if (error.code !== 'auth/popup-closed-by-user') {
      console.error('Google sign-in error:', error);
    }
    return false; // Indicate failure
  }
}

// This function creates a user profile if it doesn't already exist or updates lastLogin if it does
export async function createOrUpdateProfileOnLogin(firestore: Firestore, user: User) {
  const userProfileRef = doc(firestore, 'users', user.uid);
  
  try {
    const userProfileSnap = await getDoc(userProfileRef);

    if (!userProfileSnap.exists()) {
      // User profile doesn't exist, so create it
      const newUserProfile = {
        id: user.uid,
        name: user.displayName || 'New User',
        email: user.email,
        avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/300/300`,
        skills: ['React', 'TypeScript', 'Node.js'],
        passion: 'Developing innovative web solutions',
        availability: '10-15 hours/week',
        languages: ['English'],
        hackathonInterests: ['AI', 'Web Dev'],
        socialLinks: [],
        pulseIndex: 75,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      
      // Use the non-blocking `setDoc` with a `.catch` block for error handling
      setDocumentNonBlocking(userProfileRef, newUserProfile, { merge: false });
    } else {
      // User profile exists, just update lastLogin
      updateDocumentNonBlocking(userProfileRef, {
        lastLogin: serverTimestamp()
      });
    }
  } catch (error) {
     const contextualError = new FirestorePermissionError({
        operation: 'get',
        path: userProfileRef.path,
    });
    errorEmitter.emit('permission-error', contextualError);
  }
}


// This function creates a user profile if it doesn't already exist
export async function createProfileIfNotExists(firestore: Firestore, user: User, fullName?: string) {
  const userProfileRef = doc(firestore, 'users', user.uid);
  
  try {
    const userProfileSnap = await getDoc(userProfileRef);

    if (!userProfileSnap.exists()) {
      // User profile doesn't exist, so create it
      const name = fullName || user.displayName || 'New User';
      
      const newUserProfile = {
        id: user.uid,
        name: name,
        email: user.email,
        skills: ['React', 'TypeScript', 'Node.js'],
        passion: 'Developing innovative web solutions',
        availability: '10-15 hours/week',
        languages: ['English'],
        hackathonInterests: ['AI', 'Web Dev'],
        socialLinks: [],
        pulseIndex: 75,
        avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/300/300`,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      
      // Use the non-blocking `setDoc` with a `.catch` block for error handling
      setDocumentNonBlocking(userProfileRef, newUserProfile, { merge: false });
    }
  } catch (error) {
     const contextualError = new FirestorePermissionError({
        operation: 'get',
        path: userProfileRef.path,
    });
    errorEmitter.emit('permission-error', contextualError);
  }
}
