import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useRoleGuard = (allowedRoles: string[]) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role && !allowedRoles.includes(user.role)) {
      navigate('/');
    }
  }, [isAuthenticated, user, allowedRoles, navigate]);

  return { isAllowed: isAuthenticated && user?.role && allowedRoles.includes(user.role) };
};