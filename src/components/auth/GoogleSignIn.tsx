import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { FcGoogle } from 'react-icons/fc';

export const GoogleSignIn: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, error } = useAuth();

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // Modal will be closed by parent when auth state changes
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <FcGoogle className="w-5 h-5" />
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
    </div>
  );
};
