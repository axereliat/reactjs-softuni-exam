import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';
import { Spin, Result, Button } from 'antd';
import type { UserRole } from '../types';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const RoleBasedRoute = ({
  children,
  allowedRoles,
  redirectTo = '/'
}: RoleBasedRouteProps) => {
  const { currentUser, userRole, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If user role is not loaded yet
  if (!userRole) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="Loading user permissions..." />
      </div>
    );
  }

  // Check if user's role is in the allowed roles
  if (!allowedRoles.includes(userRole)) {
    return (
      <div style={{ padding: '50px' }}>
        <Result
          status="403"
          title="Access Denied"
          subTitle={`Sorry, you don't have permission to access this page. Required role: ${allowedRoles.join(' or ')}`}
          extra={
            <Button type="primary" onClick={() => window.location.href = redirectTo}>
              Go Back Home
            </Button>
          }
        />
      </div>
    );
  }

  // User has the required role, render the protected component
  return <>{children}</>;
};