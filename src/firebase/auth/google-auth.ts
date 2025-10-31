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
async function createProfileIfNotExists(firestore: Firestore, user: User) {
  const userProfileRef = doc(firestore, 'users', user.uid);
  const userProfileSnap = await getDoc(userProfileRef);

  if (!userProfileSnap.exists()) {
    // User profile doesn't exist, so create it
    const [firstName, ...lastName] = (user.displayName || '').split(' ');
    const newUserProfile = {
      id: user.uid,
      email: user.email,
      firstName: firstName || '',
      lastName: lastName.join(' ') || '',
      skills: ['React', 'TypeScript'],
      passion: 'Exploring new technologies',
      availability: '10-15 hours/week',
      languages: ['English'],
      hackathonInterests: ['AI', 'Web Dev'],
      socialLinks: [],
      pulseIndex: 75,
      avatar: String(Math.floor(Math.random() * 4) + 1),
    };

    // Use a non-blocking write to create the profile
    setDoc(userProfileRef, newUserProfile).catch((error) => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: userProfileRef.path,
          operation: 'create',
          requestResourceData: newUserProfile,
        })
      );
    });
  }
}
