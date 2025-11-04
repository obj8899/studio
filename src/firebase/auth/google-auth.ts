
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
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// This function handles the Google Sign-In process
export async function handleGoogleSignIn(
  auth: Auth,
  firestore: Firestore
): Promise<boolean> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // After successful sign-in, check if user profile exists
    await createProfileIfNotExists(firestore, user);

    return true; // Indicate success
  } catch (error) {
    console.error('Google sign-in error:', error);
    return false; // Indicate failure
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
