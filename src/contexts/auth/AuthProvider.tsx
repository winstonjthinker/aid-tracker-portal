
import React from 'react';
import { useAuthState } from './useAuthState';
import { useAuthMethods } from './useAuthMethods';
import { AuthProvider as BaseAuthProvider } from './AuthContext';
import { AuthContextType } from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, session, loading, setLoading } = useAuthState();
  const { signIn, signUp, createUserAccount, signOut } = useAuthMethods(setLoading);

  // Combine state and methods into a single context value
  const contextValue: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    createUserAccount,
    signOut,
  };

  return (
    <BaseAuthProvider value={contextValue}>
      {children}
    </BaseAuthProvider>
  );
};
