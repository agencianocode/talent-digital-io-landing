
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextEnhanced';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to appropriate settings page based on user type
    if (user?.type === 'business') {
      navigate('/settings/company');
    } else if (user?.type === 'talent') {
      navigate('/settings/talent-profile');
    } else {
      navigate('/settings/profile');
    }
  }, [user, navigate]);

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
