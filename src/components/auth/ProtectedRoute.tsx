import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'admin' | 'ops' | 'user';
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, loading, hasRole } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (loading) return;

      if (!user) {
        navigate(`/auth?redirect=${window.location.pathname}`);
        return;
      }

      if (requireRole) {
        const hasRequiredRole = await hasRole(requireRole);
        if (!hasRequiredRole) {
          // Check if user has admin role as fallback
          const isAdmin = await hasRole('admin');
          if (!isAdmin) {
            setAuthorized(false);
            return;
          }
        }
      }

      setAuthorized(true);
    };

    checkAuthorization();
  }, [user, loading, requireRole, navigate, hasRole]);

  if (loading || authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-destructive">Unauthorized</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <a href="/" className="text-primary hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
