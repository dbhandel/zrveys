import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

interface RequireNoAuthProps {
  children: React.ReactNode;
}

export const RequireNoAuth: React.FC<RequireNoAuthProps> = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
