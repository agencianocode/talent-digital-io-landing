import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LEGACY_REDIRECTS } from '@/lib/navigation';

interface RouteRedirectProps {
  from: string;
  to: string;
}

/**
 * Component to handle route redirects for legacy URLs
 */
export const RouteRedirect = ({ from, to }: RouteRedirectProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace: true });
  }, [navigate, to]);

  return null;
};

/**
 * Hook to handle automatic redirects based on legacy route mapping
 */
export const useLegacyRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const redirectTo = LEGACY_REDIRECTS[currentPath];
    
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate]);
};