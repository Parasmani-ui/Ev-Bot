import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Firebase Authentication Service
 */

/**
 * Admin login with email and password
 * For now, we'll use Firebase Authentication
 */
export const loginAdmin = async (email: string, password: string): Promise<User> => {
  try {
    // Set persistence to LOCAL (survives browser restart)
    await setPersistence(auth, browserLocalPersistence);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Admin logout
 */
export const logoutAdmin = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Check if user is admin (you can add custom claims in Firebase Console)
 */
export const isAdmin = async (): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user) return false;
  
  try {
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims.admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Generate or get user ID (for anonymous users)
 * Uses localStorage to persist user ID across sessions
 */
export const getUserId = (): string => {
  let userId = localStorage.getItem('jharkhand_user_id');
  
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('jharkhand_user_id', userId);
  }
  
  return userId;
};

export const authService = {
  loginAdmin,
  logoutAdmin,
  onAuthChange,
  getCurrentUser,
  isAdmin,
  getUserId
};
