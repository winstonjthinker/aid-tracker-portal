
// This file now re-exports everything from the new structure
// for backward compatibility
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import type { UserProfile, AuthContextType } from './auth/types';

export { AuthProvider, useAuth };
export type { UserProfile, AuthContextType };
