import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase/config';
import { authService } from '../services/firebase/authService';
import { userService } from '../services/api/userService';
import type { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userRole: UserRole | null;
  userData: User | null;
  loading: boolean;
  register: (email: string, password: string, displayName?: string) => Promise<FirebaseUser>;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore when Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Fetch user data including role from Firestore
          const firestoreUser = await userService.getUserById(user.uid);
          if (firestoreUser) {
            setUserData(firestoreUser);
            setUserRole(firestoreUser.role);
          } else {
            // If user doesn't exist in Firestore, create with default role
            await userService.createUser(user.uid, user.email!, user.displayName || undefined);
            const newUser = await userService.getUserById(user.uid);
            if (newUser) {
              setUserData(newUser);
              setUserRole(newUser.role);
            }
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch user data from Firestore. Using default role.');
          console.warn('To fix this, update your Firestore Security Rules.');
          console.error('Error details:', error);

          // Fallback: Use default role so app continues to work
          setUserData({
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || undefined,
            role: 'user',
            createdAt: new Date()
          });
          setUserRole('user');
        }
      } else {
        setUserData(null);
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, displayName?: string) => {
    const user = await authService.register(email, password, displayName);

    try {
      // Create user document in Firestore with default 'user' role
      await userService.createUser(user.uid, email, displayName);

      // Fetch the newly created user data
      const firestoreUser = await userService.getUserById(user.uid);
      if (firestoreUser) {
        setUserData(firestoreUser);
        setUserRole(firestoreUser.role);
      }
    } catch (error) {
      console.warn('⚠️ Could not create user in Firestore. Using default role.');
      console.error('Error details:', error);

      // Fallback: Use default role
      setUserData({
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || displayName,
        role: 'user',
        createdAt: new Date()
      });
      setUserRole('user');
    }

    setCurrentUser(user);
    return user;
  };

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password);

    try {
      // Fetch user data from Firestore
      const firestoreUser = await userService.getUserById(user.uid);
      if (firestoreUser) {
        setUserData(firestoreUser);
        setUserRole(firestoreUser.role);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch user data from Firestore. Using default role.');
      console.error('Error details:', error);

      // Fallback: Use default role
      setUserData({
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || undefined,
        role: 'user',
        createdAt: new Date()
      });
      setUserRole('user');
    }

    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setUserData(null);
    setUserRole(null);
  };

  const updateUserProfile = async (displayName?: string, photoURL?: string) => {
    await authService.updateUserProfile(displayName, photoURL);
    if (currentUser) {
      try {
        await userService.updateUserProfile(currentUser.uid, { displayName, photoURL });
        const updatedUser = await userService.getUserById(currentUser.uid);
        if (updatedUser) {
          setUserData(updatedUser);
        }
      } catch (error) {
        console.warn('⚠️ Could not update user profile in Firestore.');
        console.error('Error details:', error);

        // Update local state even if Firestore fails
        if (userData) {
          setUserData({
            ...userData,
            displayName: displayName || userData.displayName,
            photoURL: photoURL || userData.photoURL,
          });
        }
      }
      setCurrentUser({ ...currentUser });
    }
  };

  const value: AuthContextType = {
    currentUser,
    userRole,
    userData,
    loading,
    register,
    login,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
