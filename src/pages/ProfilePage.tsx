
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth, isBusinessRole, isTalentRole } from '@/contexts/SupabaseAuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userRole } = useSupabaseAuth();

  useEffect(() => {
    // Redirect to appropriate settings page based on user type
    if (isBusinessRole(userRole)) {
      navigate('/settings/company');
    } else if (isTalentRole(userRole)) {
      navigate('/settings/talent-profile');
    } else {
      navigate('/settings/profile');
    }
  }, [userRole, navigate]);

  return (
    <div className="p-8">
      <div className="bg-secondary rounded-lg p-12 min-h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground text-lg">
          Redirigiendo a configuración...
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
