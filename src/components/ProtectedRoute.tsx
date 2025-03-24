
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader } from 'lucide-react';

export type AllowedRoles = 'agent' | 'admin' | 'accountant' | 'all';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AllowedRoles[];
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles = ['all']
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-12 w-12 animate-spin-slow text-primary" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to the sign-in page but save the current location they tried to access
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is authenticated but doesn't have required role, redirect to dashboard
  if (
    profile &&
    !allowedRoles.includes('all') &&
    !allowedRoles.includes(profile.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
