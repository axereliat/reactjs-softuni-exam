import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './config';

export const authService = {
  // Register a new user
  register: async (email: string, password: string, displayName?: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }

    return userCredential.user;
  },

  // Login existing user
  login: async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  // Logout current user
  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Update user profile
  updateUserProfile: async (displayName?: string, photoURL?: string): Promise<void> => {
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, { displayName, photoURL });
    }
  }
};
