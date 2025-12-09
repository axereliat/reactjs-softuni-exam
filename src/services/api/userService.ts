import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { User, UserRole } from '../../types';

const USERS_COLLECTION = 'users';

/**
 * Create a new user document in Firestore
 */
export const createUser = async (
  uid: string,
  email: string,
  displayName?: string,
  role: UserRole = 'user'
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(userRef, {
      uid,
      email,
      displayName: displayName || '',
      role,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Get user data including role from Firestore
 */
export const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        role: data.role || 'user',
        createdAt: data.createdAt?.toDate() || new Date(),
      } as User;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (uid: string, role: UserRole): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      role,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string,
  updates: { displayName?: string; photoURL?: string }
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const userService = {
  createUser,
  getUserById,
  updateUserRole,
  updateUserProfile,
};