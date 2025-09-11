import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const AuthDebugInfo: React.FC = () => {
  const { isAuthenticated, userRole, isLoading, user } = useSupabaseAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50 max-w-xs">
      <div className="font-bold mb-1">Auth Debug:</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>Role: {userRole || 'None'}</div>
      <div>User ID: {user?.id ? user.id.substring(0, 8) + '...' : 'None'}</div>
    </div>
  );
};

export default AuthDebugInfo;