/**
 * Protected Route Component
 * Guards routes based on authentication and role
 * Validates: Requirements 10.3, 10.4
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../lib/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'employee' | 'administrator';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'administrator') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
