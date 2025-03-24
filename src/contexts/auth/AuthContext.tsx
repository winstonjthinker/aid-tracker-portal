
import React, { createContext } from 'react';
import { AuthContextType } from './types';

// Create the context with undefined as initial value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple context provider that takes the value from the hook
export const AuthProvider: React.FC<{ 
  children: React.ReactNode, 
  value: AuthContextType 
}> = ({ children, value }) => {
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
