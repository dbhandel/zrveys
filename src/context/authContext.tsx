import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  AuthError
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      
      // Get the current domain and port
      const domain = window.location.hostname;
      const port = window.location.port;
      console.log('Current domain:', domain);
      console.log('Current port:', port);
      console.log('Full URL:', window.location.href);
      
      // In development, we need to handle localhost and 127.0.0.1
      if (domain === '127.0.0.1') {
        // Automatically redirect to localhost
        const localhostUrl = `http://localhost:${port}${window.location.pathname}`;
        console.log('Redirecting to:', localhostUrl);
        window.location.href = localhostUrl;
        return;
      }
      
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Attempting Google sign in...');
      await signInWithPopup(auth, provider);
      console.log('Sign in successful!');
    } catch (err) {
      const authError = err as AuthError;
      console.error('Google sign in error details:', {
        code: authError.code,
        message: authError.message,
        customData: authError.customData,
        stack: authError.stack
      });
      
      if (authError.code === 'auth/cancelled-popup-request') {
        const error = 'Sign in was cancelled. Please try again.';
        console.log(error);
        setError(error);
      } else if (authError.code === 'auth/popup-blocked') {
        const error = 'Sign in popup was blocked. Please allow popups for this site and try again.';
        console.log(error);
        setError(error);
      } else if (authError.code === 'auth/popup-closed-by-user') {
        const error = 'Sign in popup was closed. Please try again.';
        console.log(error);
        setError(error);
      } else if (authError.code === 'auth/unauthorized-domain') {
        const error = `This domain (${window.location.hostname}) is not authorized for Firebase authentication.`;
        console.error(error);
        setError(error);
      } else {
        const error = authError.message || 'Failed to sign in with Google';
        console.error(error);
        setError(error);
      }
      throw authError;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      const authError = err as AuthError;
      console.error('Logout error:', authError);
      setError(authError.message || 'Failed to log out');
      throw authError;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
