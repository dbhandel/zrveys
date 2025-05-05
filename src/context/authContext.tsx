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
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
    } catch (err) {
      const authError = err as AuthError;
      console.error('Google sign in error:', authError);
      if (authError.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for authentication. Please contact support.');
      } else {
        setError(authError.message || 'Failed to sign in with Google');
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
